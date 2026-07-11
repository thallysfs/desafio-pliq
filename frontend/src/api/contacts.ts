import { http } from './http'
import type { Contact, ContactsQuery, PagedResult } from './types'

export function getContacts(
  query: ContactsQuery,
  signal?: AbortSignal,
): Promise<PagedResult<Contact>> {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))

  const qs = params.toString()
  return http<PagedResult<Contact>>(`/api/contacts${qs ? `?${qs}` : ''}`, { signal })
}
