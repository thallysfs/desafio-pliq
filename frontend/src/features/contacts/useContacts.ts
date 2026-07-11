import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getContacts } from '../../api/contacts'
import type { ContactsQuery } from '../../api/types'

export function useContacts(query: ContactsQuery) {
  return useQuery({
    queryKey: ['contacts', query],
    queryFn: ({ signal }) => getContacts(query, signal),
    placeholderData: keepPreviousData,
  })
}
