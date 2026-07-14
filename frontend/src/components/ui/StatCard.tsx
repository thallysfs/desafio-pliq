import type { ComponentType, ReactNode } from 'react'

interface StatCardProps {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>
  iconClassName?: string
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName = 'bg-primary-soft text-primary-strong',
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface-1 p-5 shadow-[0_4px_20px_rgba(21,28,39,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
          {label}
        </span>
        {Icon ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl leading-none font-bold text-ink">{value}</p>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
    </div>
  )
}
