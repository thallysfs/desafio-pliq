using Dapper;
using Npgsql;
using PliqCx.Api.Entities;

namespace PliqCx.Api.Repositories;

public sealed class AnalyticsRepository(NpgsqlDataSource dataSource) : IAnalyticsRepository
{
    private const string SummarySql = """
        WITH valid AS (
            SELECT r.score, s.type
            FROM responses r
            JOIN surveys s ON s.id = r.survey_id
            WHERE r.deleted_at IS NULL
        )
        SELECT
            count(*) FILTER (WHERE type = 'NPS')                            AS nps_responses,
            count(*) FILTER (WHERE type = 'NPS' AND score >= 9)             AS promoters,
            count(*) FILTER (WHERE type = 'NPS' AND score BETWEEN 7 AND 8)  AS neutrals,
            count(*) FILTER (WHERE type = 'NPS' AND score <= 6)             AS detractors,
            round(100.0 * count(*) FILTER (WHERE type = 'NPS' AND score >= 9)
                  / NULLIF(count(*) FILTER (WHERE type = 'NPS'), 0), 1)     AS promoters_pct,
            round(100.0 * count(*) FILTER (WHERE type = 'NPS' AND score BETWEEN 7 AND 8)
                  / NULLIF(count(*) FILTER (WHERE type = 'NPS'), 0), 1)     AS neutrals_pct,
            round(100.0 * count(*) FILTER (WHERE type = 'NPS' AND score <= 6)
                  / NULLIF(count(*) FILTER (WHERE type = 'NPS'), 0), 1)     AS detractors_pct,
            round(100.0 * count(*) FILTER (WHERE type = 'NPS' AND score >= 9)
                  / NULLIF(count(*) FILTER (WHERE type = 'NPS'), 0)
                - 100.0 * count(*) FILTER (WHERE type = 'NPS' AND score <= 6)
                  / NULLIF(count(*) FILTER (WHERE type = 'NPS'), 0))        AS nps_score,
            count(*)                                                        AS responses_count,
            round(avg(score) FILTER (WHERE type = 'CSAT'), 2)              AS csat_avg
        FROM valid
        """;

    public async Task<SummaryRow> GetSummaryAsync(CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        return await conn.QuerySingleAsync<SummaryRow>(
            new CommandDefinition(SummarySql, cancellationToken: ct));
    }
}
