using PliqCx.Api.Common.Exceptions;
using PliqCx.Api.Repositories;
using PliqCx.Api.Tests.Support;

namespace PliqCx.Api.Tests;

[Collection(PostgresCollection.Name)]
public sealed class ContactRepositoryTests(PostgresFixture fixture)
{
    private ContactRepository NewRepo() => new(fixture.DataSource);
    private static CancellationToken Ct => CancellationToken.None;

    [Fact]
    public async Task List_returns_only_active_contacts_with_correct_total()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();

        var (items, total) = await repo.ListAsync(null, page: 1, pageSize: 20, Ct);

        Assert.Equal(320, total);
        Assert.Equal(20, items.Count);
    }

    [Fact]
    public async Task Search_is_case_insensitive_over_name_or_email()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();

        var (_, total) = await repo.ListAsync("FABIO", page: 1, pageSize: 100, Ct);

        Assert.Equal(10, total);
    }

    [Fact]
    public async Task Pagination_uses_limit_and_offset()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();

        var (page1, _) = await repo.ListAsync(null, page: 1, pageSize: 5, Ct);
        var (page2, _) = await repo.ListAsync(null, page: 2, pageSize: 5, Ct);

        Assert.Equal(5, page1.Count);
        Assert.Equal(5, page2.Count);
        Assert.Empty(page1.Select(c => c.Id).Intersect(page2.Select(c => c.Id)));
    }

    [Fact]
    public async Task SoftDelete_hides_contact_and_frees_email()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();
        var created = await repo.CreateAsync("Teste", "livre@exemplo.com.br", null, Ct);

        var deleted = await repo.SoftDeleteAsync(created.Id, Ct);
        var afterDelete = await repo.GetAsync(created.Id, Ct);
        var recreated = await repo.CreateAsync("Outro", "LIVRE@exemplo.com.br", null, Ct);

        Assert.True(deleted);
        Assert.Null(afterDelete);
        Assert.NotEqual(created.Id, recreated.Id);
    }

    [Fact]
    public async Task Duplicate_active_email_throws_Conflict_case_insensitive()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();
        await repo.CreateAsync("Primeiro", "dup@exemplo.com.br", null, Ct);

        await Assert.ThrowsAsync<ConflictException>(
            () => repo.CreateAsync("Segundo", "DUP@exemplo.com.br", null, Ct));
    }

    [Fact]
    public async Task Update_to_another_active_email_throws_Conflict()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();
        var a = await repo.CreateAsync("A", "a@exemplo.com.br", null, Ct);
        await repo.CreateAsync("B", "b@exemplo.com.br", null, Ct);

        await Assert.ThrowsAsync<ConflictException>(
            () => repo.UpdateAsync(a.Id, "A", "b@exemplo.com.br", null, Ct));
    }

    [Fact]
    public async Task Update_returns_null_when_contact_absent()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();

        var result = await repo.UpdateAsync(999_999, "X", "x@exemplo.com.br", null, Ct);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetResponses_joins_survey_and_orders_most_recent_first()
    {
        await fixture.ResetAsync();
        var repo = NewRepo();

        var responses = await repo.GetResponsesAsync(1, Ct);

        Assert.NotEmpty(responses);
        Assert.All(responses, r => Assert.False(string.IsNullOrWhiteSpace(r.SurveyName)));
        var dates = responses.Select(r => r.RespondedAt).ToList();
        Assert.Equal(dates.OrderByDescending(d => d), dates);
    }
}
