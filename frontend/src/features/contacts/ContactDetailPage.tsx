import { ArrowLeft, History, Mail, Save, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/http'
import type { Contact, ContactResponse } from '../../api/types'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Loading } from '../../components/ui/Loading'
import { QueryState } from '../../components/ui/QueryState'
import { useToast } from '../../components/ui/Toast'
import { avatarTint, initials } from '../../utils/avatar'
import { classifyNps, type NpsClass } from '../../utils/nps'
import { ResponsesTimeline } from './ResponsesTimeline'
import { SegmentField } from './SegmentField'
import { toContactInput, validateContact } from './contactValidation'
import { useContact } from './useContact'
import { useContactResponses } from './useContactResponses'
import { useDeleteContact, useUpdateContact } from './useContactMutations'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-surface-1 px-3.5 py-2.5 text-sm text-ink focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/40 focus:outline-none'

const NPS_CLASS_LABEL: Record<NpsClass, { label: string; className: string }> = {
  promoter: { label: 'Promotor', className: 'bg-emerald-100 text-emerald-700' },
  neutral: { label: 'Neutro', className: 'bg-amber-100 text-amber-700' },
  detractor: { label: 'Detrator', className: 'bg-danger-soft text-danger' },
}

// --- Editor dos dados do aluno (inline, sempre visível) ------------------
function ProfileEditor({ contact }: { contact: Contact }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const update = useUpdateContact()
  const remove = useDeleteContact()

  const [name, setName] = useState(contact.name)
  const [email, setEmail] = useState(contact.email)
  const [segment, setSegment] = useState(contact.segment ?? '')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isDirty =
    name !== contact.name || email !== contact.email || (segment || '') !== (contact.segment ?? '')

  function reset() {
    setName(contact.name)
    setEmail(contact.email)
    setSegment(contact.segment ?? '')
    setError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateContact({ name, email })
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    try {
      await update.mutateAsync({ id: contact.id, input: toContactInput(name, email, segment) })
      showToast('success', 'Dados do aluno atualizados.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.')
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(contact.id)
      showToast('success', 'Aluno excluído.')
      navigate('/contatos')
    } catch {
      /* erro exibido no diálogo */
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface-1 p-6 shadow-[0_4px_20px_rgba(21,28,39,0.05)] lg:col-span-2">
      <div className="mb-5 flex items-center gap-4">
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-2xl font-display text-xl font-bold ${avatarTint(
            contact.id,
          )}`}
        >
          {initials(contact.name)}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-primary">{contact.name}</h2>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Mail className="h-3.5 w-3.5" />
            {contact.email}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="detail-name" className="block text-sm font-medium text-ink">
              Nome
            </label>
            <input
              id="detail-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="detail-email" className="block text-sm font-medium text-ink">
              E-mail
            </label>
            <input
              id="detail-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <SegmentField value={segment} onChange={setSegment} />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-soft"
          >
            <Trash2 className="h-4 w-4" />
            Excluir aluno
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={!isDirty || update.isPending}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-2 disabled:opacity-40"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={!isDirty || update.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {update.isPending ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </form>

      {confirmDelete ? (
        <ConfirmDialog
          title="Excluir aluno"
          message={`Tem certeza que deseja excluir "${contact.name}"? As respostas dele deixarão de aparecer nos relatórios.`}
          confirmLabel="Excluir"
          isLoading={remove.isPending}
          error={remove.error?.message}
          onConfirm={() => void handleDelete()}
          onCancel={() => {
            remove.reset()
            setConfirmDelete(false)
          }}
        />
      ) : null}
    </section>
  )
}

// --- Painel de satisfação do aluno (derivado das respostas dele) ---------
function SatisfactionPanel({ responses }: { responses: ContactResponse[] }) {
  const npsResponses = responses.filter((r) => r.surveyType === 'NPS')
  const latest = npsResponses[0]
  const latestClass = latest ? classifyNps(latest.score) : null

  const counts = npsResponses.reduce(
    (acc, r) => {
      acc[classifyNps(r.score)] += 1
      return acc
    },
    { promoter: 0, neutral: 0, detractor: 0 } as Record<NpsClass, number>,
  )

  const breakdown: { key: NpsClass; label: string; dot: string }[] = [
    { key: 'promoter', label: 'Promotoras', dot: 'bg-emerald-500' },
    { key: 'neutral', label: 'Neutras', dot: 'bg-amber-400' },
    { key: 'detractor', label: 'Detratoras', dot: 'bg-danger' },
  ]

  return (
    <section className="rounded-2xl border border-line border-t-4 border-t-primary bg-surface-1 p-6 shadow-[0_4px_20px_rgba(21,28,39,0.05)]">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
        Satisfação do aluno
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-5xl leading-none font-bold text-ink">
          {responses.length}
        </span>
        <span className="text-sm text-muted">
          {responses.length === 1 ? 'resposta' : 'respostas'}
        </span>
      </div>

      {latestClass ? (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
          <span className="text-sm text-muted">Classificação NPS mais recente</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${NPS_CLASS_LABEL[latestClass].className}`}
          >
            {NPS_CLASS_LABEL[latestClass].label}
          </span>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
          Sem respostas NPS para classificar.
        </p>
      )}

      {npsResponses.length > 0 ? (
        <div className="mt-4 space-y-2">
          {breakdown.map(({ key, label, dot }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                {label}
              </span>
              <span className="font-semibold text-ink">{counts[key]}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const contactId = Number(id)

  const contactQuery = useContact(contactId)
  const responsesQuery = useContactResponses(contactId)

  if (!Number.isFinite(contactId)) {
    return <ErrorState message="Aluno inválido." onRetry={() => navigate('/contatos')} />
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => navigate('/contatos')}
        className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a lista
      </button>

      <QueryState
        isPending={contactQuery.isPending}
        isError={contactQuery.isError}
        error={contactQuery.error}
        data={contactQuery.data}
        onRetry={() => void contactQuery.refetch()}
        loading={<Loading label="Carregando aluno…" />}
      >
        {(contact) => (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ProfileEditor contact={contact} />
              <QueryState
                isPending={responsesQuery.isPending}
                isError={responsesQuery.isError}
                error={responsesQuery.error}
                data={responsesQuery.data}
                onRetry={() => void responsesQuery.refetch()}
                loading={
                  <div className="rounded-2xl border border-line bg-surface-1 p-6">
                    <Loading />
                  </div>
                }
              >
                {(responses) => <SatisfactionPanel responses={responses} />}
              </QueryState>
            </div>

            {/* Pesquisas realizadas pelo aluno */}
            <section className="rounded-2xl border border-line bg-surface-1 p-6 shadow-[0_4px_20px_rgba(21,28,39,0.05)]">
              <div className="mb-6 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-strong">
                  <History className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">Pesquisas realizadas</h3>
                  <p className="text-sm text-muted">Histórico de respostas, da mais recente para a mais antiga.</p>
                </div>
              </div>

              <QueryState
                isPending={responsesQuery.isPending}
                isError={responsesQuery.isError}
                error={responsesQuery.error}
                data={responsesQuery.data}
                onRetry={() => void responsesQuery.refetch()}
                loading={<Loading />}
                isEmpty={(responses) => responses.length === 0}
                empty={
                  <EmptyState
                    title="Nenhuma resposta ainda"
                    description="Este aluno ainda não respondeu nenhuma pesquisa."
                  />
                }
              >
                {(responses) => <ResponsesTimeline responses={responses} />}
              </QueryState>
            </section>
          </div>
        )}
      </QueryState>
    </section>
  )
}
