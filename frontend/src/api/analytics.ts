import { http } from './http'
import type { Summary } from './types'

export function getSummary(signal?: AbortSignal): Promise<Summary> {
  return http<Summary>('/api/analytics/summary', { signal })
}
