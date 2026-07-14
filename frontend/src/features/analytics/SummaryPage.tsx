import { CheckCircle2, Gauge, MessageSquare, Star, TrendingUp } from 'lucide-react'
import type { Summary } from '../../api/types'
import { EmptyState } from '../../components/ui/EmptyState'
import { QueryState } from '../../components/ui/QueryState'
import { StatCard } from '../../components/ui/StatCard'
import { formatDecimal } from '../../utils/format'
import { useSummary } from './useSummary'
import { SummarySkeleton } from './SummarySkeleton'
import { ClassBucketCard } from './ClassBucketCard'
import { npsZoneLabel } from './npsZone'

const DISTRIBUTION_SEGMENTS = [
  { key: 'promoters', label: 'Promotores', color: 'bg-emerald-500' },
  { key: 'neutrals', label: 'Neutros', color: 'bg-amber-400' },
  { key: 'detractors', label: 'Detratores', color: 'bg-danger' },
] as const

function DistributionBar({ summary }: { summary: Summary }) {
  return (
    <div className="relative mt-6">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/20">
        {DISTRIBUTION_SEGMENTS.map(({ key, color }) => (
          <div key={key} className={color} style={{ width: `${summary[key].pct}%` }} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-white/85">
        {DISTRIBUTION_SEGMENTS.map(({ key, label, color }) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            {label} · {formatDecimal(summary[key].pct, 1)}%
          </span>
        ))}
      </div>
    </div>
  )
}

export function SummaryPage() {
  const { data, isPending, isError, error, refetch } = useSummary()

  return (
    <section>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Visão Geral</h1>
        <p className="mt-1 text-muted">
          Acompanhamento da satisfação com todas as respostas válidas do período.
        </p>
      </div>

      <QueryState
        isPending={isPending}
        isError={isError}
        error={error}
        data={data}
        onRetry={() => void refetch()}
        loading={<SummarySkeleton />}
        isEmpty={(summary) => summary.responsesCount === 0}
        empty={
          <EmptyState
            title="Nenhuma resposta encontrada"
            description="Ainda não há respostas válidas registradas no período."
          />
        }
      >
        {(summary) => (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Herói NPS */}
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary-bright to-primary p-7 text-white shadow-[0_10px_40px_rgba(166,59,0,0.25)] lg:col-span-2">
                <Gauge
                  className="pointer-events-none absolute -right-6 -bottom-8 h-48 w-48 opacity-10"
                  strokeWidth={1.2}
                />
                <div className="relative">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                    <Gauge className="h-4 w-4" />
                    NPS Score — período completo
                  </div>
                  <div className="mt-2 flex items-end gap-4">
                    <span className="font-display text-6xl leading-none font-bold tracking-tight">
                      {summary.npsScore}
                    </span>
                    <span className="mb-1.5 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Zona de {npsZoneLabel(summary.npsScore)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/80">
                    Calculado sobre {summary.npsResponses} respostas de pesquisas NPS.
                  </p>
                  <DistributionBar summary={summary} />
                </div>
              </div>

              {/* Métricas gerais */}
              <div className="grid grid-cols-1 gap-6">
                <StatCard
                  label="Respostas totais"
                  value={summary.responsesCount.toLocaleString('pt-BR')}
                  description="Todas as pesquisas (NPS e CSAT)"
                  icon={MessageSquare}
                />
                <StatCard
                  label="CSAT médio"
                  value={
                    summary.csatAvg === null ? (
                      '—'
                    ) : (
                      <span className="flex items-baseline gap-1">
                        {formatDecimal(summary.csatAvg, 2)}
                        <span className="text-base font-medium text-muted">/ 5</span>
                      </span>
                    )
                  }
                  description={
                    summary.csatAvg === null
                      ? 'Sem respostas CSAT no período'
                      : 'Média das pesquisas CSAT (escala 1–5)'
                  }
                  icon={Star}
                  iconClassName="bg-amber-100 text-amber-600"
                />
              </div>
            </div>

            {/* Distribuição detalhada */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <TrendingUp className="h-4 w-4 text-primary" />
                Distribuição das respostas NPS
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ClassBucketCard
                  label="Promotores"
                  bucket={summary.promoters}
                  npsClass="promoter"
                />
                <ClassBucketCard label="Neutros" bucket={summary.neutrals} npsClass="neutral" />
                <ClassBucketCard
                  label="Detratores"
                  bucket={summary.detractors}
                  npsClass="detractor"
                />
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </section>
  )
}
