using PliqCx.Api.Entities;

namespace PliqCx.Api.Repositories;

public interface IAnalyticsRepository
{
    Task<SummaryRow> GetSummaryAsync(CancellationToken ct);
}
