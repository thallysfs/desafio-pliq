import { CheckCircle2, XCircle } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

type ToastVariant = 'success' | 'error'

interface ToastMessage {
  id: number
  variant: ToastVariant
  text: string
}

interface ToastContextValue {
  showToast: (variant: ToastVariant, text: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextToastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timeoutsRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const location = useLocation()
  const isFirstLocation = useRef(true)

  const clearToasts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current.clear()
    setToasts([])
  }, [])

  useEffect(() => {
    if (isFirstLocation.current) {
      isFirstLocation.current = false
      return
    }
    clearToasts()
  }, [location.key, clearToasts])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current.clear()
    }
  }, [])

  const showToast = useCallback((variant: ToastVariant, text: string) => {
    const id = nextToastId++
    setToasts((current) => [...current, { id, variant, text }])
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(id)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
    timeoutsRef.current.set(id, timeoutId)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => {
            const Icon = toast.variant === 'success' ? CheckCircle2 : XCircle
            return (
              <div
                key={toast.id}
                role="status"
                className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
                  toast.variant === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {toast.text}
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}
