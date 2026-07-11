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
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
        className={`w-full ${SIZE_CLASS[size]} rounded-xl bg-white p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon ? (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClassName}`}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
              </span>
            ) : null}
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
