using PliqCx.Api.Dtos;
using PliqCx.Api.Entities;
using PliqCx.Api.Repositories;

namespace PliqCx.Api.Services;

public sealed class ContactService(IContactRepository repository) : IContactService
{
    public async Task<PagedResult<ContactDto>> ListAsync(ContactQuery query, CancellationToken ct)
    {
        var (items, total) = await repository.ListAsync(query.Search, query.Page, query.PageSize, ct);
        var dtos = items.Select(ToDto).ToList();
        return new PagedResult<ContactDto>(dtos, total, query.Page, query.PageSize);
    }

    public async Task<ContactDto?> GetAsync(int id, CancellationToken ct)
    {
        var contact = await repository.GetAsync(id, ct);
        return contact is null ? null : ToDto(contact);
    }

    public async Task<ContactDto> CreateAsync(ContactRequest request, CancellationToken ct)
    {
        var contact = await repository.CreateAsync(
            request.Name!.Trim(), request.Email!.Trim(), NormalizeSegment(request.Segment), ct);
        return ToDto(contact);
    }

    public async Task<ContactDto?> UpdateAsync(int id, ContactRequest request, CancellationToken ct)
    {
        var contact = await repository.UpdateAsync(
            id, request.Name!.Trim(), request.Email!.Trim(), NormalizeSegment(request.Segment), ct);
        return contact is null ? null : ToDto(contact);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct)
        => repository.SoftDeleteAsync(id, ct);

    public async Task<IReadOnlyList<ContactResponseDto>?> GetResponsesAsync(int id, CancellationToken ct)
    {
        if (await repository.GetAsync(id, ct) is null)
            return null;

        var responses = await repository.GetResponsesAsync(id, ct);
        return responses.Select(ToDto).ToList();
    }

    private static ContactDto ToDto(Contact c)
        => new(c.Id, c.Name, c.Email, c.Segment);

    private static ContactResponseDto ToDto(ContactResponse r)
        => new(r.Id, r.SurveyId, r.SurveyName, r.SurveyType, r.Score, r.Comment, r.Channel, r.RespondedAt);

    private static string? NormalizeSegment(string? segment)
        => string.IsNullOrWhiteSpace(segment) ? null : segment.Trim();
}
