---
name: desafio-pliq-mini-cx
description: >-
  Constituição do desafio técnico PliQ "Mini CX" (rede de academias Vita Bem-Estar):
  regras de negócio, valores de conferência, restrições técnicas e critérios de
  avaliação. Consulte SEMPRE que estiver mexendo em qualquer camada deste desafio —
  schema/DDL, query SQL, importação do seed, endpoint da API C#/Dapper, ou tela React
  de contatos/respostas/resumo — mesmo que o usuário não cite a skill. Gatilhos:
  NPS, CSAT, promotores/neutros/detratores, npsScore, csatAvg, responsesCount,
  soft delete / deletedAt, contatos, respostas, resumo de satisfação, segmento,
  seed.json, Dapper, parâmetros nomeados, agregação em SQL, valores de conferência.
  Use antes de escrever SQL ou calcular métricas para não errar as regras que
  "derrubam a nota".
---

# Desafio PliQ — Mini CX (constituição)

Sistema para o time de Customer Experience da **Vita Bem-Estar** (rede de academias):
cadastrar contatos (alunos), ver o histórico de respostas de cada um e acompanhar um
resumo geral de satisfação. Três camadas: **banco relacional + SQL à mão (Dapper)**,
**API REST C# (.NET 8+)** e **frontend React/TS**.

Dados em `data/seed.json`: 3 pesquisas, 320 contatos, ~1.280 respostas do 1º semestre de
2026. Importar o seed faz parte do desafio.

Esta skill é o guardrail do build. As regras abaixo são **verificáveis** — a banca usa a
tabela de conferência (seção 9) para pegar erro. Quando um número não bater, os suspeitos
de sempre são: filtro de `deletedAt` esquecido, mistura de escalas NPS×CSAT, ou
arredondamento antes da hora.

---

## 1. Regra nº 1 — soft delete (`deletedAt`) ⚠️ crítica

Toda resposta e todo contato têm `deletedAt`. Quando **não é `null`**, o registro foi
excluído logicamente (ex.: LGPD) e **não pode entrar em nenhuma consulta, cálculo,
listagem ou exportação**.

- `WHERE deleted_at IS NULL` em **toda** query de leitura/agregação/JOIN/export.
- DELETE de contato é **soft delete**: marca `deleted_at`, não apaga a linha. Contato
  excluído some de todas as leituras.
- É o erro clássico. Se os valores de conferência não baterem, comece suspeitando daqui.

## 2. Classificação NPS (só pesquisas tipo `NPS`, escala 0–10)

| Classe | Notas |
|---|---|
| Detrator | 0 a 6 |
| Neutro | 7 a 8 |
| Promotor | 9 a 10 |

Faça a classificação no banco com `CASE` (não em memória). Ver seção 7.

## 3. Fórmulas e arredondamento

Com `total` = respostas válidas (não excluídas) no recorte filtrado:

```
promoters_pct  = promotores / total * 100
neutrals_pct   = neutros    / total * 100
detractors_pct = detratores / total * 100
nps_score      = promoters_pct - detractors_pct
```

- `responsesCount` = total de respostas válidas no recorte, **de qualquer tipo de
  pesquisa** (única métrica agnóstica de escala).
- `csatAvg` = média aritmética das notas das pesquisas tipo `CSAT` (escala 1–5).

**Arredonde só ao formatar** — calcule com precisão total no meio do caminho:

| Valor | Formato |
|---|---|
| `npsScore` | inteiro (ex.: `24`) — arredonde a diferença das pct **cruas**, não das já arredondadas |
| percentuais | 1 casa decimal (ex.: `48.8`) |
| `csatAvg` | 2 casas decimais (ex.: `3.91`) |

Por quê: arredondar cedo (ex.: `round(promoters_pct) - round(detractors_pct)`) muda o
`npsScore` inteiro. Some as porcentagens cruas e arredonde só o resultado final.

## 4. Separação de escalas — nunca misturar

Misturar escalas não faz sentido: métricas de NPS consideram **apenas** respostas de
pesquisas tipo `NPS`; `csatAvg` considera **apenas** as tipo `CSAT`. `responsesCount`
conta tudo (seção 3). Filtre por `surveys.type` no JOIN/`WHERE`.

## 5. Filtros e agrupamentos (bônus)

- **Período** `from`/`to`: filtra por `respondedAt`, **inclusivo nas duas pontas** (o dia
  `to` inteiro conta). Formato `yyyy-MM-dd`. Valide os parâmetros.
- **Pesquisa** `surveyId`: restringe àquela pesquisa.
- **Mês (série temporal)**: agrupe pelo mês de `respondedAt` **em UTC**; rótulo do bucket
  `"2026-01"`, `"2026-02"`, … As datas do seed já estão em UTC longe da virada do dia.
- **Meses sem respostas não entram na série** — só gere bucket para mês com ≥1 resposta
  válida (NPS de zero respostas não existe; não divida por zero).
- **Segmento**: vem de `contacts.segment` — exige JOIN entre respostas e contatos.

## 6. Validações do cadastro de contatos

| Campo | Regra |
|---|---|
| `name` | obrigatório, não vazio |
| `email` | obrigatório, formato válido, **único entre contatos não excluídos** (case-insensitive) → duplicado responde **409** |
| `segment` | opcional; texto livre (seed usa "Plano Black", "Plano Fit", "Corporativo") |

Erros de validação → **400** (ou **409** para e-mail duplicado) com corpo JSON
`{ "error": "mensagem legível" }`. O e-mail volta a ficar livre depois que o contato que
o usava é excluído (unicidade só entre não-excluídos).

## 7. Restrições técnicas — eixo Banco/SQL (peso alto, reprova fácil)

- **Dapper + SQL escrito à mão.** ORM completo (EF Core, NHibernate) **não vale** — a
  banca quer ler o seu SQL. Usar EF derruba o eixo.
- **Agregação no banco**: contagens, somas, `GROUP BY`, `CASE`, `JOIN` acontecem em SQL.
  Carregar a tabela para a memória e contar com LINQ/JS conta como **não feito**.
  Formatar/arredondar o resultado no C# é aceitável; agregar no C# não é.
- **Parâmetros sempre nomeados.** SQL montado por concatenação/interpolação de entrada do
  usuário **reprova o eixo de banco inteiro**, independente do resto. Zero exceções —
  inclusive em busca (`LIKE @termo`), paginação (`LIMIT @limit OFFSET @offset`) e
  filtros.
- Paginação e busca acontecem **no banco**, não filtrando em memória.
- Índices onde importa, **com comentário explicando o porquê** (item que impressiona):
  e-mail (busca + unicidade), `responded_at` (filtros de período/mês), `survey_id` e
  `contact_id` (JOIN e histórico), `deleted_at`.

## 8. Contrato e arquitetura — eixo API

O contrato completo (shapes exatos, status codes, query params) está em
**`references/contrato-api.md`** — leia esse arquivo antes de escrever qualquer endpoint
ou DTO e siga-o à risca; contrato divergente derruba nota. Regras que valem sempre:

- Recursos sob `/api`, JSON em `camelCase`; datas ISO 8601 UTC. Erros → `400`/`409` com
  `{ "error": "..." }`; recurso inexistente/excluído → `404`.
- Separação de responsabilidades: **endpoint fino**, acesso a dados isolado, lógica de
  negócio **fora** do endpoint. C# idiomático.
- **Escopo atual: só o obrigatório** — CRUD de contatos (`GET/POST/PUT/DELETE
  /api/contacts`, com busca+paginação **no banco**, `201`+`Location`, soft delete `204`,
  `409` de e-mail duplicado que não acusa o próprio contato); histórico
  `GET /api/contacts/{id}/responses` (JOIN com surveys, mais recente primeiro);
  `GET /api/analytics/summary` (shape fixo do doc, agregado em SQL). Os **bônus** (filtros
  no resumo, nps-by-month, nps-by-segment, export CSV, `/api/surveys`) estão descritos na
  referência mas **não entram agora**.

## 9. Valores de conferência (para validar o SQL)

Período completo do seed (01/01/2026 a 30/06/2026), **sem** filtro de pesquisa, já
aplicado `deletedAt`. Se algo não bater → seção 1, 3 ou 4.

**Resumo geral**

| Métrica | Valor |
|---|---|
| `responsesCount` (todas as pesquisas) | **1246** |
| Respostas válidas (NPS) | **978** |
| Promotores / Neutros / Detratores | **477 / 256 / 245** |
| `promoters_pct` | **48.8** |
| `neutrals_pct` | **26.2** |
| `detractors_pct` | **25.1** |
| `npsScore` | **24** |
| `csatAvg` (268 respostas CSAT) | **3.91** |

**NPS por mês** (bônus): 2026-01 → 104 resp, **17** · 2026-02 → 112, **26** · 2026-03 →
270, **11** · 2026-04 → 96, **14** · 2026-05 → 121, **22** · 2026-06 → 275, **42**.

**NPS por segmento** (bônus, JOIN com contatos): Plano Black → 415 resp, **31** ·
Corporativo → 292, **19** · Plano Fit → 271, **18**.

**Com filtro de pesquisa** (bônus): só "NPS Pós-Treino" (id 1) → **21** · só "NPS
Relacionamento 2026" (id 2) → **29**. Ex.: filtrando pela pesquisa id 2, a série mensal
tem só `2026-03` e `2026-06`.

## 10. Critérios de avaliação (pesos) e armadilhas

Pesos (total 100 + até 10 de bônus): **Corretude das regras 25**, **Banco/SQL 20**,
**Frontend 20**, **API REST 15**, **Experiência de uso 10**, **Comunicação 10**.
Pleno espera profundidade: ≥1 bônus bem feito (testes são o mais valorizado), decisões
justificadas no README, nenhum item da lista de baixo.

**Derruba a nota rápido:** valores de conferência não batendo (esp. `deletedAt`
ignorado); SQL por concatenação/interpolação de input (reprova eixo 2 inteiro); agregação
em memória; EF no lugar de Dapper; contrato divergente; `any` como tipo padrão no front;
lógica de negócio dentro do endpoint; projeto que não sobe seguindo o próprio README;
commit único gigante; crash na tela quando a API retorna erro.

**Impressiona:** testes cobrindo as consultas de analytics contra os valores de
conferência; índices com comentário explicando o porquê; paginação/busca fluidas
(debounce, estado preservado); estados intermediários tratados (skeleton, retry, empty
state com CTA); README com seção "o que eu faria diferente com mais tempo" honesta.

**Frontend/UX:** componentização com fronteiras sensatas; TS de verdade (sem `any`);
camada de API (não `fetch` solto em todo componente); estado de servidor gerenciado com
clareza; busca/paginação/CRUD refletidos na tela sem recarregar; loading/erro/vazio
tratados; confirmação antes de excluir.

**Comunicação:** README com setup que funciona de primeira (banco incluído) e decisões
justificadas; commits pequenos e descritivos; **declaração de uso de IA** (declare como
usou; você precisa defender cada linha, em especial cada query, na conversa técnica).

## 11. Entrega

Repositório Git privado (monorepo `/backend` + `/frontend` ou como preferir, desde que o
README explique). Commits pequenos e descritivos — histórico é avaliado, nada de commit
único "versão final". Bônus: escolha 1 ou 2 (não tente todos) — filtros no resumo, NPS
por mês com gráfico, NPS por segmento, testes, export CSV, Docker Compose, CI.
