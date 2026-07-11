export type NpsClass = 'promoter' | 'neutral' | 'detractor'

export function classifyNps(score: number): NpsClass {
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'neutral'
  return 'detractor'
}
