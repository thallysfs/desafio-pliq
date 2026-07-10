using Microsoft.AspNetCore.Mvc;
using PliqCx.Api.Dtos;
using PliqCx.Api.Services;

namespace PliqCx.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public sealed class AnalyticsController(IAnalyticsService service) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<SummaryDto>> GetSummary(CancellationToken ct)
        => Ok(await service.GetSummaryAsync(ct));
}
