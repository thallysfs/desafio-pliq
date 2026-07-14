import { useQuery } from '@tanstack/react-query'
import { getContact } from '../../api/contacts'

export function useContact(id: number) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: ({ signal }) => getContact(id, signal),
  })
}
