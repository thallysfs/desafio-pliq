import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-muted">
      <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-surface-3 text-primary">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {description ? <p className="text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
