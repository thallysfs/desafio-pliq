import { http } from './http'
import type { Contact, ContactInput, ContactResponse, ContactsQuery, PagedResult } from './types'

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

export function getContact(id: number, signal?: AbortSignal): Promise<Contact> {
  return http<Contact>(`/api/contacts/${id}`, { signal })
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

export function getContactResponses(
  id: number,
  signal?: AbortSignal,
): Promise<ContactResponse[]> {
  return http<ContactResponse[]>(`/api/contacts/${id}/responses`, { signal })
}
