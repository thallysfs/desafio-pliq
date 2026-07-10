namespace PliqCx.Api.Features.Contacts;

/// <summary>Contato como exposto pela API (o contrato não expõe created_at/deleted_at).</summary>
public sealed record Contact(int Id, string Name, string Email, string? Segment);

/// <summary>Corpo de POST/PUT. Campos anuláveis para detectar ausência na validação.</summary>
public sealed record ContactUpsertRequest(string? Name, string? Email, string? Segment);

/// <summary>Resultado paginado de GET /api/contacts.</summary>
public sealed record ContactListResult(
    IReadOnlyList<Contact> Items,
    long Total,
    int Page,
    int PageSize);

/// <summary>Item do histórico de respostas de um contato (JOIN com surveys).</summary>
public sealed record ContactResponseItem(
    int Id,
    int SurveyId,
    string SurveyName,
    string SurveyType,
    int Score,
    string? Comment,
    string Channel,
    DateTime RespondedAt);
