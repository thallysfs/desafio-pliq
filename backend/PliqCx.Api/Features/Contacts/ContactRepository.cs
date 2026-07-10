using Dapper;
using Npgsql;

namespace PliqCx.Api.Features.Contacts;

public interface IContactRepository
{
    Task<ContactListResult> ListAsync(string? search, int page, int pageSize, CancellationToken ct);
    Task<Contact?> GetAsync(int id, CancellationToken ct);
    Task<Contact> CreateAsync(string name, string email, string? segment, CancellationToken ct);
    Task<Contact?> UpdateAsync(int id, string name, string email, string? segment, CancellationToken ct);
    Task<bool> SoftDeleteAsync(int id, CancellationToken ct);
    Task<IReadOnlyList<ContactResponseItem>> GetResponsesAsync(int contactId, CancellationToken ct);
}

public sealed class ContactRepository(NpgsqlDataSource dataSource) : IContactRepository
{
    public async Task<ContactListResult> ListAsync(string? search, int page, int pageSize, CancellationToken ct)
    {
        const string filter = """
            WHERE deleted_at IS NULL
              AND (@search IS NULL OR name ILIKE @pattern OR email ILIKE @pattern)
            """;

        var pattern = search is null ? null : $"%{search}%";
        var args = new { search, pattern, limit = pageSize, offset = (page - 1) * pageSize };

        await using var conn = await dataSource.OpenConnectionAsync(ct);

        var total = await conn.ExecuteScalarAsync<long>(new CommandDefinition(
            $"SELECT count(*) FROM contacts {filter}", args, cancellationToken: ct));

        var items = await conn.QueryAsync<Contact>(new CommandDefinition($"""
            SELECT id, name, email, segment
            FROM contacts
            {filter}
            ORDER BY name, id
            LIMIT @limit OFFSET @offset
            """, args, cancellationToken: ct));

        return new ContactListResult(items.AsList(), total, page, pageSize);
    }

    public async Task<Contact?> GetAsync(int id, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        return await conn.QuerySingleOrDefaultAsync<Contact>(new CommandDefinition("""
            SELECT id, name, email, segment
            FROM contacts
            WHERE id = @id AND deleted_at IS NULL
            """, new { id }, cancellationToken: ct));
    }

    public async Task<Contact> CreateAsync(string name, string email, string? segment, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        return await conn.QuerySingleAsync<Contact>(new CommandDefinition("""
            INSERT INTO contacts (name, email, segment)
            VALUES (@name, @email, @segment)
            RETURNING id, name, email, segment
            """, new { name, email, segment }, cancellationToken: ct));
    }

    public async Task<Contact?> UpdateAsync(int id, string name, string email, string? segment, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        return await conn.QuerySingleOrDefaultAsync<Contact>(new CommandDefinition("""
            UPDATE contacts
            SET name = @name, email = @email, segment = @segment
            WHERE id = @id AND deleted_at IS NULL
            RETURNING id, name, email, segment
            """, new { id, name, email, segment }, cancellationToken: ct));
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        var affected = await conn.ExecuteAsync(new CommandDefinition("""
            UPDATE contacts SET deleted_at = now()
            WHERE id = @id AND deleted_at IS NULL
            """, new { id }, cancellationToken: ct));
        return affected > 0;
    }

    public async Task<IReadOnlyList<ContactResponseItem>> GetResponsesAsync(int contactId, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        var rows = await conn.QueryAsync<ContactResponseItem>(new CommandDefinition("""
            SELECT r.id,
                   r.survey_id,
                   s.name AS survey_name,
                   s.type AS survey_type,
                   r.score::int AS score,
                   r.comment,
                   r.channel,
                   r.responded_at
            FROM responses r
            JOIN surveys s ON s.id = r.survey_id
            WHERE r.contact_id = @contactId AND r.deleted_at IS NULL
            ORDER BY r.responded_at DESC, r.id DESC
            """, new { contactId }, cancellationToken: ct));
        return rows.AsList();
    }
}
