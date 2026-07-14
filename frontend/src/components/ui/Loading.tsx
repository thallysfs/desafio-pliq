interface LoadingProps {
  label?: string
}

export function Loading({ label = 'Carregando…' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-surface-4 border-t-primary-bright" />
      <span>{label}</span>
    </div>
  )
}
