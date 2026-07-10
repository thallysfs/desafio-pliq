using System.ComponentModel.DataAnnotations;

namespace PliqCx.Api.Dtos;

public sealed class ContactQuery
{
    public string? Search { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "page deve ser >= 1.")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "pageSize deve estar entre 1 e 100.")]
    public int PageSize { get; set; } = 20;
}
