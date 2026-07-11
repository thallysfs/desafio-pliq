import type { Contact, ContactResponse } from '../../api/types'
import { EmptyState } from '../../components/ui/EmptyState'
import { Loading } from '../../components/ui/Loading'
import { Modal } from '../../components/ui/Modal'
import { QueryState } from '../../components/ui/QueryState'
import { classifyNps, type NpsClass } from '../../utils/nps'
import { useContactResponses } from './useContactResponses'

interface ContactHistoryProps {
  contact: Contact
  onClose: () => void
}

const NPS_BADGE_CLASS: Record<NpsClass, string> = {
  promoter: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-amber-100 text-amber-700',
  detractor: 'bg-red-100 text-red-700',
}

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  link: 'Link',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ScoreBadge({ response }: { response: ContactResponse }) {
  if (response.surveyType === 'NPS') {
    const npsClass = classifyNps(response.score)
    return (
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${NPS_BADGE_CLASS[npsClass]}`}
      >
        {response.score}/10
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
      {response.score}/5
    </span>
  )
}

export function ContactHistory({ contact, onClose }: ContactHistoryProps) {
  const { data, isPending, isError, error, refetch } = useContactResponses(contact.id)

  return (
    <Modal title={`Histórico — ${contact.name}`} onClose={onClose} size="lg">
      <div className="max-h-[60vh] overflow-y-auto">
        <QueryState
          isPending={isPending}
          isError={isError}
          error={error}
          data={data}
          onRetry={() => void refetch()}
          loading={<Loading />}
          isEmpty={(responses) => responses.length === 0}
          empty={
            <EmptyState
              title="Nenhuma resposta encontrada"
              description="Esse contato ainda não respondeu nenhuma pesquisa."
            />
          }
        >
          {(responses) => (
            <ul className="divide-y divide-slate-100">
              {responses.map((response) => (
                <li key={response.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{response.surveyName}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(response.respondedAt)} ·{' '}
                        {CHANNEL_LABEL[response.channel] ?? response.channel}
                      </p>
                    </div>
                    <ScoreBadge response={response} />
                  </div>
                  {response.comment ? (
                    <p className="mt-1.5 text-sm text-slate-600 italic">“{response.comment}”</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </div>
    </Modal>
  )
}
