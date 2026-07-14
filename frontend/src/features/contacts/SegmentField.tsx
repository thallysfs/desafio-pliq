import { KNOWN_SEGMENTS } from './contactValidation'

interface SegmentFieldProps {
  value: string
  onChange: (value: string) => void
}

// Texto livre (o backend aceita qualquer string) + chips de sugestão dos 3
// segmentos do seed. Sem <datalist> de propósito: o Chromium desenha uma seta
// nativa não estilizável em <input list>.
export function SegmentField({ value, onChange }: SegmentFieldProps) {
  return (
    <div>
      <label htmlFor="contact-segment" className="block text-sm font-medium text-ink">
        Segmento <span className="text-muted">(opcional)</span>
      </label>
      <input
        id="contact-segment"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-line bg-surface-1 px-3.5 py-2.5 text-sm text-ink focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/40 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {KNOWN_SEGMENTS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
              value === option
                ? 'border-primary bg-primary-soft text-primary-strong'
                : 'border-line text-muted hover:border-primary/40 hover:bg-primary-soft hover:text-primary-strong'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
