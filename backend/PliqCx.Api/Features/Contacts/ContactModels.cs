namespace PliqCx.Api.Features.Contacts;

public sealed record Contact(int Id, string Name, string Email, string? Segment);

public sealed record ContactUpsertRequest(string? Name, string? Email, string? Segment);

public sealed record ContactListResult(
    IReadOnlyList<Contact> Items,
    long Total,
    int Page,
    int PageSize);

public sealed record ContactResponseItem(
    int Id,
    int SurveyId,
    string SurveyName,
    string SurveyType,
    int Score,
    string? Comment,
    string Channel,
    DateTime RespondedAt);
