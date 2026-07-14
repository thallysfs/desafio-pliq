import { Gauge, MessageSquare, Star, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Contact, ContactInput } from '../../api/types'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Loading } from '../../components/ui/Loading'
import { Pagination } from '../../components/ui/Pagination'
import { QueryState } from '../../components/ui/QueryState'
import { SearchInput } from '../../components/ui/SearchInput'
import { StatCard } from '../../components/ui/StatCard'
import { useToast } from '../../components/ui/Toast'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { formatDecimal } from '../../utils/format'
import { useSummary } from '../analytics/useSummary'
import { ContactForm } from './ContactForm'
import { ContactsTable } from './ContactsTable'
import { useContacts } from './useContacts'
import { useCreateContact, useDeleteContact } from './useContactMutations'

const PAGE_SIZE = 20

export function ContactsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 400)
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)

  const { showToast } = useToast()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isPending, isError, error, refetch, isFetching } = useContacts({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })
  const summary = useSummary()

  const createContact = useCreateContact()
  const deleteContact = useDeleteContact()

  async function handleCreate(input: ContactInput) {
    await createContact.mutateAsync(input)
    showToast('success', 'Aluno cadastrado.')
    setShowCreate(false)
  }

  function openDelete(contact: Contact) {
    deleteContact.reset()
    setDeleteTarget(contact)
  }

  function closeDelete() {
    deleteContact.reset()
    setDeleteTarget(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteContact.mutateAsync(deleteTarget.id)
      showToast('success', 'Aluno excluído.')
      setDeleteTarget(null)
    } catch {
      return
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Gestão de Alunos
          </h1>
          <p className="mt-1 text-muted">
            Gerencie a base de alunos e acompanhe a satisfação em tempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Novo Aluno
        </button>
      </div>

      <div className="mb-4 max-w-md">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscar por nome ou e-mail…"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-[0_4px_20px_rgba(21,28,39,0.05)]">
        <QueryState
          isPending={isPending}
          isError={isError}
          error={error}
          data={data}
          onRetry={() => void refetch()}
          loading={<Loading />}
          isEmpty={(result) => result.items.length === 0}
          empty={
            <EmptyState
              title="Nenhum aluno encontrado"
              description={
                debouncedSearch
                  ? `Não encontramos resultados para "${debouncedSearch}".`
                  : 'Ainda não há alunos cadastrados.'
              }
            />
          }
        >
          {(result) => (
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <div className="overflow-x-auto">
                <ContactsTable
                  contacts={result.items}
                  onOpen={(contact) => navigate(`/contatos/${contact.id}`)}
                  onDelete={openDelete}
                />
              </div>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={result.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </QueryState>
      </div>

      {/* Indicadores gerais (dados reais do resumo + total da base) */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="NPS Geral"
          value={summary.data ? summary.data.npsScore : '—'}
          description="Todas as pesquisas NPS do período"
          icon={Gauge}
        />
        <StatCard
          label="Total de alunos"
          value={data ? data.total.toLocaleString('pt-BR') : '—'}
          description="Cadastros ativos na base"
          icon={MessageSquare}
          iconClassName="bg-surface-3 text-primary"
        />
        <StatCard
          label="CSAT médio"
          value={
            summary.data
              ? summary.data.csatAvg === null
                ? '—'
                : formatDecimal(summary.data.csatAvg, 2)
              : '—'
          }
          description="Satisfação média (escala 1–5)"
          icon={Star}
          iconClassName="bg-amber-100 text-amber-600"
        />
      </div>

      {showCreate ? (
        <ContactForm
          isSubmitting={createContact.isPending}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Excluir aluno"
          message={`Tem certeza que deseja excluir "${deleteTarget.name}"? As respostas dele deixarão de aparecer nos relatórios.`}
          confirmLabel="Excluir"
          isLoading={deleteContact.isPending}
          error={deleteContact.error?.message}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={closeDelete}
        />
      ) : null}
    </section>
  )
}
