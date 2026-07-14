import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-1 py-2.5 pr-3 pl-10 text-sm text-ink placeholder:text-muted focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/40 focus:outline-none"
      />
    </div>
  )
}
