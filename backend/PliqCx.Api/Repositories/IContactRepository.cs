using PliqCx.Api.Entities;

namespace PliqCx.Api.Repositories;

public interface IContactRepository
{
    Task<(IReadOnlyList<Contact> Items, long Total)> ListAsync(string? search, int page, int pageSize, CancellationToken ct);
    Task<Contact?> GetAsync(int id, CancellationToken ct);
    Task<Contact> CreateAsync(string name, string email, string? segment, CancellationToken ct);
    Task<Contact?> UpdateAsync(int id, string name, string email, string? segment, CancellationToken ct);
    Task<bool> SoftDeleteAsync(int id, CancellationToken ct);
    Task<IReadOnlyList<ContactResponse>> GetResponsesAsync(int contactId, CancellationToken ct);
}
