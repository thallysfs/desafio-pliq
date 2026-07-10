using System.ComponentModel.DataAnnotations;
using PliqCx.Api.Common.Validation;

namespace PliqCx.Api.Dtos;

public sealed record ContactRequest(
    [NotBlank(ErrorMessage = "name é obrigatório.")]
    string? Name,

    [NotBlank(ErrorMessage = "email é obrigatório.")]
    [EmailAddress(ErrorMessage = "email tem formato inválido.")]
    string? Email,

    string? Segment);
