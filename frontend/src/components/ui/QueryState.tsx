import type { ReactNode } from 'react'
import { ErrorState } from './ErrorState'

interface QueryStateProps<T> {
  isPending: boolean
  isError: boolean
  error: Error | null
  data: T | undefined
  onRetry: () => void
  loading: ReactNode
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  children: (data: T) => ReactNode
}

export function QueryState<T>({
  isPending,
  isError,
  error,
  data,
  onRetry,
  loading,
  isEmpty,
  empty,
  children,
}: QueryStateProps<T>) {
  if (isPending || data === undefined) {
    return <>{loading}</>
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={onRetry} />
  }

  if (isEmpty?.(data)) {
    return <>{empty}</>
  }

  return <>{children(data)}</>
}
