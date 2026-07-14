function Box({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-4 ${className}`} />
}

export function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Box className="h-56 lg:col-span-2" />
        <div className="grid grid-cols-1 gap-6">
          <Box className="h-[104px]" />
          <Box className="h-[104px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Box className="h-28" />
        <Box className="h-28" />
        <Box className="h-28" />
      </div>
    </div>
  )
}
