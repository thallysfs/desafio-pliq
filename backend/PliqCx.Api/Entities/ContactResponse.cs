namespace PliqCx.Api.Entities;

public sealed record ContactResponse(
    int Id,
    int SurveyId,
    string SurveyName,
    string SurveyType,
    int Score,
    string? Comment,
    string Channel,
    DateTime RespondedAt);
