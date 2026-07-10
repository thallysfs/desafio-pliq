namespace PliqCx.Api.Dtos;

public sealed record ContactResponseDto(
    int Id,
    int SurveyId,
    string SurveyName,
    string SurveyType,
    int Score,
    string? Comment,
    string Channel,
    DateTime RespondedAt);
