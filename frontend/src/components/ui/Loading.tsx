interface LoadingProps {
  label?: string
}

export function Loading({ label = 'Carregando…' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      <span>{label}</span>
    </div>
  )
}
