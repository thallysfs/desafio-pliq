namespace PliqCx.Api.Dtos;

public sealed record ClassBucketDto(long Count, decimal Pct);

public sealed record SummaryDto(
    int NpsScore,
    long NpsResponses,
    ClassBucketDto Promoters,
    ClassBucketDto Neutrals,
    ClassBucketDto Detractors,
    long ResponsesCount,
    decimal? CsatAvg);
