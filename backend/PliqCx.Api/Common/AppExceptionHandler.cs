using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using PliqCx.Api.Common.Exceptions;

namespace PliqCx.Api.Common;

public sealed class AppExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not ConflictException conflict)
            return false;

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
        await httpContext.Response.WriteAsJsonAsync(
            new ErrorResponse(conflict.Message), cancellationToken);
        return true;
    }
}
