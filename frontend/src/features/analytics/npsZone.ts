export function npsZoneLabel(score: number): string {
  if (score <= 0) return 'Crítica'
  if (score <= 50) return 'Aperfeiçoamento'
  if (score <= 75) return 'Qualidade'
  return 'Excelência'
}
