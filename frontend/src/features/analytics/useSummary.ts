import { useQuery } from '@tanstack/react-query'
import { getSummary } from '../../api/analytics'

export function useSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: ({ signal }) => getSummary(signal),
  })
}
