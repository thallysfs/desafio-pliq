using Microsoft.AspNetCore.Http.HttpResults;

namespace PliqCx.Api.Features.Analytics;

/// <summary>Registro do módulo de Analytics: DI + endpoint de resumo.</summary>
public static class AnalyticsModule
{
    public static IServiceCollection AddAnalyticsModule(this IServiceCollection services)
    {
        services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
        return services;
    }

    public static IEndpointRouteBuilder MapAnalyticsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/analytics").WithTags("Analytics");
        group.MapGet("/summary", Summary);
        return app;
    }

    private static async Task<Ok<SummaryResponse>> Summary(IAnalyticsRepository repo, CancellationToken ct)
        => TypedResults.Ok(await repo.GetSummaryAsync(ct));
}
