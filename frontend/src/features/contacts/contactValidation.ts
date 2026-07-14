import type { ContactInput } from '../../api/types'

export const KNOWN_SEGMENTS = ['Plano Black', 'Plano Fit', 'Corporativo'] as const

// Espelha as validações do backend, mas com mensagens humanizadas em pt-BR.
// O e-mail duplicado (409) e qualquer 400 residual continuam vindo da API.
export function validateContact(input: {
  name: string
  email: string
}): string | null {
  if (!input.name.trim()) return 'Nome é obrigatório.'
  if (!input.email.trim()) return 'E-mail é obrigatório.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return 'E-mail em formato inválido.'
  return null
}

export function toContactInput(name: string, email: string, segment: string): ContactInput {
  return { name: name.trim(), email: email.trim(), segment: segment.trim() || null }
}
