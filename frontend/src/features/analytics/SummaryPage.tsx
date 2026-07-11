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
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <span className="text-sm font-medium text-slate-500">NPS Score</span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-5xl font-semibold text-slate-900">
                    {summary.npsScore}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {npsZoneLabel(summary.npsScore)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {summary.npsResponses} respostas NPS
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ClassBucketCard
                  label="Promotores"
                  bucket={summary.promoters}
                  colorClass="bg-emerald-500"
                />
                <ClassBucketCard
                  label="Neutros"
                  bucket={summary.neutrals}
                  colorClass="bg-amber-400"
                />
                <ClassBucketCard
                  label="Detratores"
                  bucket={summary.detractors}
                  colorClass="bg-red-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="Respostas totais"
                  value={summary.responsesCount}
                  description="Todas as pesquisas (NPS e CSAT)"
                />
                <StatCard
                  label="CSAT médio"
                  value={summary.csatAvg === null ? '—' : formatDecimal(summary.csatAvg, 2)}
                  description={
                    summary.csatAvg === null
                      ? 'Sem respostas CSAT no período'
                      : 'Escala de 1 a 5'
                  }
                />
              </div>
            </div>
          )}
        </QueryState>
      </div>
    </section>
  )
}
