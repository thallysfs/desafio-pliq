import type { ClassBucket } from '../../api/types'

interface ClassBucketCardProps {
  label: string
  bucket: ClassBucket
  colorClass: string
}

export function ClassBucketCard({ label, bucket, colorClass }: ClassBucketCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{bucket.count}</p>
      <p className="text-sm text-slate-500">{bucket.pct.toFixed(1)}%</p>
    </div>
  )
}
