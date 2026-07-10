using PliqCx.Api.Repositories;
using PliqCx.Api.Services;
using PliqCx.Api.Tests.Support;

namespace PliqCx.Api.Tests;

[Collection(PostgresCollection.Name)]
public sealed class AnalyticsSummaryTests(PostgresFixture fixture)
{
    [Fact]
    public async Task Summary_matches_the_conference_values()
    {
        await fixture.ResetAsync();
        var service = new AnalyticsService(new AnalyticsRepository(fixture.DataSource));

        var summary = await service.GetSummaryAsync(CancellationToken.None);

        Assert.Equal(1246, summary.ResponsesCount);
        Assert.Equal(978, summary.NpsResponses);
        Assert.Equal(24, summary.NpsScore);

        Assert.Equal(477, summary.Promoters.Count);
        Assert.Equal(48.8m, summary.Promoters.Pct);
        Assert.Equal(256, summary.Neutrals.Count);
        Assert.Equal(26.2m, summary.Neutrals.Pct);
        Assert.Equal(245, summary.Detractors.Count);
        Assert.Equal(25.1m, summary.Detractors.Pct);

        Assert.NotNull(summary.CsatAvg);
        Assert.Equal(3.91m, summary.CsatAvg!.Value);
    }
}
