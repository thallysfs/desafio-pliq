using Dapper;
using Microsoft.AspNetCore.Mvc.Testing;
using Npgsql;
using Testcontainers.PostgreSql;

namespace PliqCx.Api.Tests.Support;

public sealed class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:17")
        .Build();

    private string _seedSql = default!;

    public NpgsqlDataSource DataSource { get; private set; } = default!;
    public WebApplicationFactory<Program> Factory { get; private set; } = default!;

    public async Task InitializeAsync()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
        await _container.StartAsync();

        var connectionString = _container.GetConnectionString();
        DataSource = NpgsqlDataSource.Create(connectionString);

        var dbDir = Path.Combine(AppContext.BaseDirectory, "db");
        var schemaSql = await File.ReadAllTextAsync(Path.Combine(dbDir, "01-schema.sql"));
        _seedSql = await File.ReadAllTextAsync(Path.Combine(dbDir, "02-seed.sql"));

        await ExecuteAsync(schemaSql);
        await ExecuteAsync(_seedSql);

        Factory = new PliqWebApplicationFactory(connectionString);
    }

    public async Task ResetAsync()
    {
        await ExecuteAsync("TRUNCATE responses, contacts, surveys RESTART IDENTITY CASCADE;");
        await ExecuteAsync(_seedSql);
    }

    private async Task ExecuteAsync(string sql)
    {
        await using var conn = await DataSource.OpenConnectionAsync();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DisposeAsync()
    {
        await Factory.DisposeAsync();
        await DataSource.DisposeAsync();
        await _container.DisposeAsync();
    }
}
