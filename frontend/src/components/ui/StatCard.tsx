import type { ReactNode } from 'react'

interface StatCardProps {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}
