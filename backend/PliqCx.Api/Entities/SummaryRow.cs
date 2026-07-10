namespace PliqCx.Api.Entities;

public sealed record SummaryRow(
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
