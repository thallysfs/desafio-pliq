namespace PliqCx.Api.Features.Analytics;

public sealed record ClassBucket(long Count, decimal Pct);

public sealed record SummaryResponse(
    int NpsScore,
    long NpsResponses,
    ClassBucket Promoters,
    ClassBucket Neutrals,
    ClassBucket Detractors,
    long ResponsesCount,
    decimal? CsatAvg);

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
