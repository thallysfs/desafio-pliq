// Iniciais e cor determinística para o avatar do aluno (derivados do nome —
// não há foto no cadastro; iniciais mantêm a lista legível sem inventar dados).

const AVATAR_TINTS = [
  'bg-primary-soft text-primary-strong',
  'bg-surface-3 text-primary',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-surface-4 text-ink',
] as const

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function avatarTint(seed: string | number): string {
  const n = typeof seed === 'number' ? seed : Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_TINTS[n % AVATAR_TINTS.length]
}
