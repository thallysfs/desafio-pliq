# Mini CX — Vita Bem-Estar

Painel interno de Customer Experience para a **Vita Bem-Estar** (rede de academias):
cadastro de contatos (CRUD com busca e paginação), histórico de respostas por contato e
um resumo agregado de satisfação (**NPS** e **CSAT**).

Três camadas, monorepo:

| Camada | Tecnologia |
|---|---|
| Banco | PostgreSQL 17 (via Docker), **SQL escrito à mão** — sem ORM |
| API | C# / **.NET 10**, Dapper + Npgsql, arquitetura em camadas (Controllers → Services → Repositories) |
| Front | React 19 + TypeScript, Vite, Tailwind v4, TanStack Query, React Router |

---

## Como executar

Pré-requisitos: **Docker** (+ Docker Compose) e **Node 20+**. Para rodar a API fora do
container você também precisa do **.NET SDK 10**.

### Opção A — Docker Compose (recomendado)

Sobe o banco (já com schema + seed carregados na primeira subida) e a API, prontos:

```bash
docker compose up -d --build
```

- Banco em `localhost:5432` (`pliq` / `pliq` / db `pliq_cx`)
- API em **http://localhost:5080**

Confira que subiu certo (deve retornar `"npsScore": 24`):

```bash
curl http://localhost:5080/api/analytics/summary
```

Depois, em outro terminal, suba o front:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  → já aponta para a API em :5080
```

Abra **http://localhost:5173**.

Para derrubar tudo (o volume `pliq_pgdata` preserva os dados entre subidas):

```bash
docker compose down          # mantém os dados
docker compose down -v       # zera o banco (re-executa schema + seed na próxima subida)
```

### Opção B — API local com `dotnet run`

Útil para desenvolver na API sem rebuildar o container. Suba **só o banco** pelo Compose
e rode a API na máquina:

```bash
docker compose up -d db
cd backend/PliqCx.Api
dotnet run --urls http://localhost:5009
```

Nesse caso a API fica em **:5009**. Ajuste o front para apontar para ela:

```bash
cd frontend
cp .env.example .env
# edite .env → VITE_API_URL=http://localhost:5009
npm install && npm run dev
```

### Testes

Bateria de integração (xUnit + **Testcontainers**, sobe um Postgres efêmero, aplica o
mesmo schema/seed e valida as consultas contra os valores de conferência). **Precisa de
Docker rodando**:

```bash
cd backend/PliqCx.Api.Tests
dotnet test
```

19 testes cobrindo: analytics vs. valores de conferência, repositório (busca CI,
paginação, soft delete liberando e-mail, tradução de `23505` → conflito) e o contrato HTTP
ponta a ponta (201+Location, 409/400 com `{error}`, 404 de excluído, shape do JOIN).

---

## O que o sistema faz

Endpoints obrigatórios (contrato completo em
[`.agents/skills/desafio-pliq-mini-cx/references/contrato-api.md`](.agents/skills/desafio-pliq-mini-cx/references/contrato-api.md)):

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/contacts` | Lista com **busca** (nome/e-mail) e **paginação**, ambas no banco |
| `POST` | `/api/contacts` | Cria contato → `201` + `Location` |
| `PUT` | `/api/contacts/{id}` | Atualiza |
| `DELETE` | `/api/contacts/{id}` | **Soft delete** → `204` |
| `GET` | `/api/contacts/{id}/responses` | Histórico (JOIN com surveys, mais recente primeiro) |
| `GET` | `/api/analytics/summary` | Resumo agregado (NPS, distribuição, CSAT), calculado em SQL |

Valores de conferência (período completo do seed, `deletedAt` aplicado): `responsesCount`
**1246**, NPS válidas **978**, promotores/neutros/detratores **477 / 256 / 245**
(48.8 / 26.2 / 25.1 %), **npsScore 24**, **csatAvg 3.91** — todos batem contra o Postgres
real e estão cobertos por teste.

---

## Decisões tomadas

**PostgreSQL como SGBD.** Escolhido pela facilidade de subir um container reproduzível
com schema + seed já carregados na primeira inicialização (`db/init` montado em
`/docker-entrypoint-initdb.d`) — o avaliador roda um comando e tem o banco pronto. `pg_trgm`
resolve a busca por nome/e-mail com índice.

**Dapper + SQL à mão, sem ORM.** O desafio quer ler o SQL. Toda agregação (contagens,
`GROUP BY`, `CASE` de classificação NPS, JOINs) acontece **no banco**; o C# só formata e
arredonda o resultado. **Parâmetros sempre nomeados** — zero concatenação de input, inclusive
em busca (`LIKE @termo`) e paginação (`LIMIT @limit OFFSET @offset`).

**Soft delete via índice único parcial.** E-mail único "apenas entre contatos ativos" é
implementado com um índice único **parcial** sobre `lower(email) WHERE deleted_at IS NULL`.
Isso dá de graça a regra "e-mail volta a ficar livre depois que o contato é excluído",
delegando a unicidade ao banco (o repositório traduz o `PostgresException 23505` em `409`).
`WHERE deleted_at IS NULL` está em toda leitura/agregação/JOIN.

**NPS e CSAT nunca se misturam.** Métricas de NPS só olham respostas de pesquisas tipo
`NPS` (escala 0–10); `csatAvg` só as tipo `CSAT` (escala 1–5); `responsesCount` conta tudo.
Filtro por `surveys.type` no JOIN. Percentuais crus somados antes de arredondar o
`npsScore` (arredondar cedo mudaria o inteiro final).

**Arquitetura em camadas na API (não Minimal API).** Controllers finos (`[ApiController]`,
`ActionResult`, roteamento por atributo) → Services (regra + mapeamento manual entity↔DTO,
sem AutoMapper) → Repositories (Dapper). Escolha consciente para poder defender cada
fronteira na conversa técnica. Erros centralizados: DataAnnotations + `[NotBlank]` custom
(o `[Required]` aceita whitespace), `InvalidModelStateResponseFactory` devolvendo o shape
`{error}` do contrato, e um `IExceptionHandler` global traduzindo conflitos em `409`.

**Índices comentados no schema.** e-mail (busca + unicidade parcial), `responded_at`
(filtros de período), `survey_id` / `contact_id` (JOIN e histórico), `deleted_at` — cada um
com um comentário no SQL explicando o porquê.

**Frontend com camada de API tipada e estado de servidor via TanStack Query.** Nenhum
`fetch` solto: wrapper `http.ts` com `ApiError`, hooks de query/mutation que invalidam o
cache no sucesso. Busca com debounce (400 ms) e paginação com `keepPreviousData` (sem piscar
a tela). CRUD reflete na lista sem reload. Loading / erro / vazio sempre explícitos
(componente `QueryState<T>` genérico). Confirmação antes de excluir. TypeScript de verdade,
sem `any`. A classificação de cor de cada resposta NPS (verde/âmbar/vermelho) replica a
**regra de negócio** exata; CSAT recebe badge neutro (a regra só define classes para NPS).

**Testes de integração como bônus.** Testcontainers sobe um Postgres real e roda o mesmo
schema/seed — as consultas de analytics são verificadas contra os valores de conferência,
não contra mocks. É o bônus mais valorizado e o que dá confiança de que os números batem.

**Docker Compose como bônus.** Um único `up` sobe banco + API já conectados (a API aponta
para o serviço `db`, não `localhost`), com healthcheck e ordem de dependência.

**Escopo.** Foi implementado **o obrigatório** com capricho, priorizando testes e Docker
como bônus. Os demais bônus (filtros no resumo, NPS por mês/segmento com gráfico, export
CSV, `/api/surveys`) ficaram de fora deliberadamente — o schema e o seed já suportam todos
(os valores de conferência desses recortes inclusive já batem no banco), mas preferi
profundidade no núcleo a espalhar esforço.

---

## O que eu faria diferente com mais tempo

- **Gráfico de NPS por mês/segmento.** O SQL de agregação já foi validado contra os valores
  de conferência; faltou só o endpoint e a visualização. Seria o próximo bônus.
- **Dark mode e refino de acessibilidade** (o desafio não exige WCAG formal, segui boas
  práticas — foco visível, contraste AA, erro comunicado por texto, não só cor).
- **Testes de front** (component/e2e). A verificação hoje foi manual/Playwright contra a API
  real; valeria um `vitest` + Testing Library cobrindo os estados de loading/erro/vazio.
- **Paginação com contagem total mais barata** e cache de `count(*)` para listas grandes.
- **Observabilidade** (logs estruturados / health endpoint dedicado) para produção.

---

## Estrutura do repositório

```
├── db/                 Schema + seed do Postgres (carregados na 1ª subida do container)
│   ├── init/           01-schema.sql, 02-seed.sql
│   └── data/           seed.json (fonte) — regerado por scratchpad/gen_seed.py
├── backend/
│   ├── PliqCx.Api/     API .NET 10 (Controllers · Services · Repositories · Dtos · Entities · Common)
│   ├── PliqCx.Api.Tests/  Integração via Testcontainers (xUnit)
│   └── Dockerfile      Multi-stage, roda como usuário não-root na 8080
├── frontend/           React 19 + Vite + Tailwind v4 + TanStack Query
├── docker-compose.yml  Serviços db (5432) + api (5080)
└── README.md
```

---

## Declaração de uso de IA

Este projeto foi desenvolvido com apoio de IA (Claude Code) como par de programação, sob
minha revisão e decisão em cada etapa:

- **Modelagem do banco, escolha do SGBD, estratégia de índices e de soft delete** foram
  decididas em conjunto, discutindo trade-offs — não são saída automática. Cada query foi
  lida, entendida e validada por mim contra os valores de conferência.
- **A arquitetura em camadas da API foi uma escolha minha explícita** (em vez de Minimal
  APIs), justamente para conseguir defender cada fronteira na conversa técnica.
- A IA acelerou o boilerplate (DTOs, wrappers, componentes de UI), a escrita dos testes e o
  redesign visual, sempre a partir de direção e revisão minha.
- **Assumo autoria e sei defender cada linha** — em especial cada consulta SQL, as fórmulas
  de NPS/CSAT e as regras de arredondamento e de separação de escalas.
