import { Meh, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { ClassBucket } from '../../api/types'
import { StatCard } from '../../components/ui/StatCard'
import { formatDecimal } from '../../utils/format'
import type { NpsClass } from '../../utils/nps'

interface ClassBucketCardProps {
  label: string
  bucket: ClassBucket
  npsClass: NpsClass
}

const CLASS_CONFIG: Record<NpsClass, { icon: typeof ThumbsUp; iconClassName: string }> = {
  promoter: { icon: ThumbsUp, iconClassName: 'bg-emerald-100 text-emerald-700' },
  neutral: { icon: Meh, iconClassName: 'bg-amber-100 text-amber-700' },
  detractor: { icon: ThumbsDown, iconClassName: 'bg-red-100 text-red-700' },
}

export function ClassBucketCard({ label, bucket, npsClass }: ClassBucketCardProps) {
  const { icon, iconClassName } = CLASS_CONFIG[npsClass]

  return (
    <StatCard
      label={label}
      value={bucket.count}
      description={`${formatDecimal(bucket.pct, 1)}%`}
      icon={icon}
      iconClassName={iconClassName}
    />
  )
}
