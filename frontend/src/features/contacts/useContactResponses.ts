import { useQuery } from '@tanstack/react-query'
import { getContactResponses } from '../../api/contacts'

export function useContactResponses(contactId: number) {
  return useQuery({
    queryKey: ['contacts', contactId, 'responses'],
    queryFn: ({ signal }) => getContactResponses(contactId, signal),
  })
}
