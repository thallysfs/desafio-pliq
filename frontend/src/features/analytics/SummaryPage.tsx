import { Activity, CheckCircle2, Gauge, MessageSquare, Star } from 'lucide-react'
import { EmptyState } from '../../components/ui/EmptyState'
import { QueryState } from '../../components/ui/QueryState'
import { StatCard } from '../../components/ui/StatCard'
import { formatDecimal } from '../../utils/format'
import { useSummary } from './useSummary'
import { SummarySkeleton } from './SummarySkeleton'
import { ClassBucketCard } from './ClassBucketCard'
import { npsZoneLabel } from './npsZone'

export function SummaryPage() {
  const { data, isPending, isError, error, refetch } = useSummary()

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">Resumo de satisfação</h1>
      <p className="mt-1 text-slate-500">Todas as respostas válidas do período.</p>

      <div className="mt-6">
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
              <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary-strong p-6 text-white">
                <Activity
                  className="pointer-events-none absolute -right-5 -bottom-6 h-40 w-40 opacity-15"
                  strokeWidth={1.4}
                />
                <div className="relative flex items-center gap-1.5 text-sm font-medium text-white/90">
                  <Gauge className="h-4 w-4" />
                  NPS Score
                </div>
                <div className="relative mt-1 flex items-baseline gap-3">
                  <span className="text-5xl font-bold tracking-tight">{summary.npsScore}</span>
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {npsZoneLabel(summary.npsScore)}
                  </span>
                </div>
                <p className="relative mt-2 text-sm text-white/85">
                  {summary.npsResponses} respostas NPS
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ClassBucketCard label="Promotores" bucket={summary.promoters} npsClass="promoter" />
                <ClassBucketCard label="Neutros" bucket={summary.neutrals} npsClass="neutral" />
                <ClassBucketCard label="Detratores" bucket={summary.detractors} npsClass="detractor" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="Respostas totais"
                  value={summary.responsesCount}
                  description="Todas as pesquisas (NPS e CSAT)"
                  icon={MessageSquare}
                />
                <StatCard
                  label="CSAT médio"
                  value={summary.csatAvg === null ? '—' : formatDecimal(summary.csatAvg, 2)}
                  description={
                    summary.csatAvg === null
                      ? 'Sem respostas CSAT no período'
                      : 'Escala de 1 a 5'
                  }
                  icon={Star}
                  iconClassName="bg-accent-soft text-accent"
                />
              </div>
            </div>
          )}
        </QueryState>
      </div>
    </section>
  )
}
