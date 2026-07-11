// Zonas de NPS (Reichheld/NPS Prism) — só rotulagem visual, não afeta o cálculo.
export function npsZoneLabel(score: number): string {
  if (score <= 0) return 'Crítica'
  if (score <= 50) return 'Aperfeiçoamento'
  if (score <= 75) return 'Qualidade'
  return 'Excelência'
}
