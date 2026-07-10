namespace PliqCx.Api.Common;

/// <summary>Corpo de erro padrão do contrato: { "error": "mensagem legível" }.</summary>
public sealed record ErrorResponse(string Error);
