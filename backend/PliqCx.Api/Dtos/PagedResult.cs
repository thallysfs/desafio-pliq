namespace PliqCx.Api.Dtos;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    long Total,
    int Page,
    int PageSize);
