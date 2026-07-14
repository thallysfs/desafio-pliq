import { Gauge, Link2, Mail, MessageCircle, Star } from 'lucide-react'
import type { ComponentType } from 'react'
import type { ContactResponse } from '../../api/types'
import { classifyNps, type NpsClass } from '../../utils/nps'

// Cores por classe NPS replicam a regra de negócio (0–6 detrator, 7–8 neutro,
// 9–10 promotor) — só aplicadas a pesquisas NPS. CSAT recebe tom neutro, sem
// classificação inventada (a regra só define classes para NPS).
const NPS_STYLE: Record<NpsClass, { border: string; badge: string; label: string }> = {
  promoter: {
    border: 'border-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Promotor',
  },
  neutral: { border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'Neutro' },
  detractor: { border: 'border-danger', badge: 'bg-danger-soft text-danger', label: 'Detrator' },
}

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  link: 'Link',
}

const CHANNEL_ICON: Record<string, ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  email: Mail,
  link: Link2,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TimelineItem({ response }: { response: ContactResponse }) {
  const isNps = response.surveyType === 'NPS'
  const npsClass = isNps ? classifyNps(response.score) : null
  const style = npsClass ? NPS_STYLE[npsClass] : null
  const ChannelIcon = CHANNEL_ICON[response.channel]
  const NodeIcon = isNps ? Gauge : Star

  return (
    <li className="relative flex gap-4 sm:gap-6">
      {/* Nó da timeline */}
      <span
        className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md ${
          isNps ? 'bg-primary-bright' : 'bg-surface-4 text-primary'
        }`}
      >
        <NodeIcon className="h-4.5 w-4.5" strokeWidth={2.25} />
      </span>

      {/* Cartão */}
      <div
        className={`flex-1 rounded-xl border-l-4 bg-surface-2 p-5 transition-shadow hover:shadow-md ${
          style ? style.border : 'border-surface-4'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-ink">{response.surveyName}</h4>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  style ? style.badge : 'bg-surface-4 text-ink'
                }`}
              >
                {isNps ? `NOTA ${response.score}` : `CSAT ${response.score}/5`}
              </span>
              {style ? (
                <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {style.label}
                </span>
              ) : null}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              {ChannelIcon ? <ChannelIcon className="h-3.5 w-3.5" /> : null}
              {CHANNEL_LABEL[response.channel] ?? response.channel}
            </p>
          </div>
          <span className="text-xs font-medium text-muted">{formatDate(response.respondedAt)}</span>
        </div>

        {response.comment ? (
          <p className="mt-3 rounded-lg border border-line bg-surface-1 p-3 text-sm text-muted italic">
            “{response.comment}”
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function ResponsesTimeline({ responses }: { responses: ContactResponse[] }) {
  return (
    <ul className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-5 before:w-px before:bg-line">
      {responses.map((response) => (
        <TimelineItem key={response.id} response={response} />
      ))}
    </ul>
  )
}
