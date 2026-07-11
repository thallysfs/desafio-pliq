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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon ? (
          <span
            className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md ${iconClassName}`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}
