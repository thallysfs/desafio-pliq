using PliqCx.Api.Dtos;

namespace PliqCx.Api.Services;

public interface IContactService
{
    Task<PagedResult<ContactDto>> ListAsync(ContactQuery query, CancellationToken ct);
    Task<ContactDto?> GetAsync(int id, CancellationToken ct);
    Task<ContactDto> CreateAsync(ContactRequest request, CancellationToken ct);
    Task<ContactDto?> UpdateAsync(int id, ContactRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(int id, CancellationToken ct);
    Task<IReadOnlyList<ContactResponseDto>?> GetResponsesAsync(int id, CancellationToken ct);
}
