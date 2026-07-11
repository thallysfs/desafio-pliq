import { http } from './http'
import type { Contact, ContactInput, ContactsQuery, PagedResult } from './types'

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

export function createContact(input: ContactInput): Promise<Contact> {
  return http<Contact>('/api/contacts', { method: 'POST', body: input })
}

export function updateContact(id: number, input: ContactInput): Promise<Contact> {
  return http<Contact>(`/api/contacts/${id}`, { method: 'PUT', body: input })
}

export function deleteContact(id: number): Promise<void> {
  return http<void>(`/api/contacts/${id}`, { method: 'DELETE' })
}
