using PliqCx.Api.Dtos;
using PliqCx.Api.Repositories;

namespace PliqCx.Api.Services;

public sealed class AnalyticsService(IAnalyticsRepository repository) : IAnalyticsService
{
    public async Task<SummaryDto> GetSummaryAsync(CancellationToken ct)
    {
        var row = await repository.GetSummaryAsync(ct);

        return new SummaryDto(
            NpsScore: (int)(row.NpsScore ?? 0),
            NpsResponses: row.NpsResponses,
            Promoters: new ClassBucketDto(row.Promoters, row.PromotersPct ?? 0m),
            Neutrals: new ClassBucketDto(row.Neutrals, row.NeutralsPct ?? 0m),
            Detractors: new ClassBucketDto(row.Detractors, row.DetractorsPct ?? 0m),
            ResponsesCount: row.ResponsesCount,
            CsatAvg: row.CsatAvg);
    }
}
