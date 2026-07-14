import { useEffect, type ComponentType, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>
  iconClassName?: string
}

const SIZE_CLASS: Record<'md' | 'lg', string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({
  title,
  onClose,
  children,
  size = 'md',
  icon: Icon,
  iconClassName = 'bg-primary-soft text-primary-strong',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
        className={`w-full ${SIZE_CLASS[size]} rounded-2xl bg-surface-1 p-6 shadow-2xl`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon ? (
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClassName}`}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
              </span>
            ) : null}
            <h2 id="modal-title" className="font-display text-lg font-bold text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
