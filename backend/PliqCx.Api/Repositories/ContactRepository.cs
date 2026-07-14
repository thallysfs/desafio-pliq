using Dapper;
using Npgsql;
using PliqCx.Api.Common.Exceptions;
using PliqCx.Api.Entities;

namespace PliqCx.Api.Repositories;

public sealed class ContactRepository(NpgsqlDataSource dataSource) : IContactRepository
{
    public async Task<(IReadOnlyList<Contact> Items, long Total)> ListAsync(
        string? search, int page, int pageSize, CancellationToken ct)
    {
        const string filter = """
            WHERE deleted_at IS NULL
              AND (@search IS NULL OR lower(name) LIKE lower(@pattern) OR lower(email) LIKE lower(@pattern))
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

        return (items.AsList(), total);
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
        try
        {
            await using var conn = await dataSource.OpenConnectionAsync(ct);
            return await conn.QuerySingleAsync<Contact>(new CommandDefinition("""
                INSERT INTO contacts (name, email, segment)
                VALUES (@name, @email, @segment)
                RETURNING id, name, email, segment
                """, new { name, email, segment }, cancellationToken: ct));
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new ConflictException("Já existe um contato com esse e-mail.");
        }
    }

    public async Task<Contact?> UpdateAsync(int id, string name, string email, string? segment, CancellationToken ct)
    {
        try
        {
            await using var conn = await dataSource.OpenConnectionAsync(ct);
            return await conn.QuerySingleOrDefaultAsync<Contact>(new CommandDefinition("""
                UPDATE contacts
                SET name = @name, email = @email, segment = @segment
                WHERE id = @id AND deleted_at IS NULL
                RETURNING id, name, email, segment
                """, new { id, name, email, segment }, cancellationToken: ct));
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new ConflictException("Já existe um contato com esse e-mail.");
        }
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

    public async Task<IReadOnlyList<ContactResponse>> GetResponsesAsync(int contactId, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        var rows = await conn.QueryAsync<ContactResponse>(new CommandDefinition("""
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
