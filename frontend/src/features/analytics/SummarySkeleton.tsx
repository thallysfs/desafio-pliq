function Box({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

export function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <Box className="h-32 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Box className="h-24" />
        <Box className="h-24" />
        <Box className="h-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Box className="h-24" />
        <Box className="h-24" />
      </div>
    </div>
  )
}
