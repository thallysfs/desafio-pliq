import type { ClassBucket } from '../../api/types'
import { StatCard } from '../../components/ui/StatCard'
import { formatDecimal } from '../../utils/format'

interface ClassBucketCardProps {
  label: string
  bucket: ClassBucket
  colorClass: string
}

export function ClassBucketCard({ label, bucket, colorClass }: ClassBucketCardProps) {
  return (
    <StatCard
      label={
        <span className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
          {label}
        </span>
      }
      value={bucket.count}
      description={`${formatDecimal(bucket.pct, 1)}%`}
    />
  )
}
