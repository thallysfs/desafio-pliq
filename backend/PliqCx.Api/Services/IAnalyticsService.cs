using PliqCx.Api.Dtos;

namespace PliqCx.Api.Services;

public interface IAnalyticsService
{
    Task<SummaryDto> GetSummaryAsync(CancellationToken ct);
}
