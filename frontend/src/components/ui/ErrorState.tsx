import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="text-danger">{message ?? 'Algo deu errado ao carregar os dados.'}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </button>
      ) : null}
    </div>
  )
}
