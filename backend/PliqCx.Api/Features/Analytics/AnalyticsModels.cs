namespace PliqCx.Api.Features.Analytics;

/// <summary>Contagem + percentual de uma classe NPS (promotor/neutro/detrator).</summary>
public sealed record ClassBucket(long Count, decimal Pct);

/// <summary>Resposta de GET /api/analytics/summary (shape fixo do contrato).</summary>
public sealed record SummaryResponse(
    int NpsScore,
    long NpsResponses,
    ClassBucket Promoters,
    ClassBucket Neutrals,
    ClassBucket Detractors,
    long ResponsesCount,
    decimal? CsatAvg);

/// <summary>Linha achatada vinda do SQL agregado; mapeada para SummaryResponse.</summary>
internal sealed record SummaryRow(
    long NpsResponses,
    long Promoters,
    long Neutrals,
    long Detractors,
    decimal? PromotersPct,
    decimal? NeutralsPct,
    decimal? DetractorsPct,
    decimal? NpsScore,
    long ResponsesCount,
    decimal? CsatAvg);
