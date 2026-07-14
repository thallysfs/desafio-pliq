import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-4 text-sm text-muted">
      <span>{total === 0 ? 'Nenhum resultado' : `${start}–${end} de ${total}`}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-lg border border-line px-4 py-2 font-semibold text-ink hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-lg bg-primary-bright px-4 py-2 font-semibold text-white hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-4 disabled:text-muted"
        >
          Próxima
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
