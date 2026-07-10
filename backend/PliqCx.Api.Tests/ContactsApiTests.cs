using System.Net;
using System.Net.Http.Json;
using PliqCx.Api.Common;
using PliqCx.Api.Dtos;
using PliqCx.Api.Tests.Support;

namespace PliqCx.Api.Tests;

[Collection(PostgresCollection.Name)]
public sealed class ContactsApiTests(PostgresFixture fixture)
{
    private async Task<HttpClient> ClientAsync()
    {
        await fixture.ResetAsync();
        return fixture.Factory.CreateClient();
    }

    [Fact]
    public async Task Summary_endpoint_returns_conference_values()
    {
        var client = await ClientAsync();

        var summary = await client.GetFromJsonAsync<SummaryDto>("/api/analytics/summary");

        Assert.NotNull(summary);
        Assert.Equal(24, summary!.NpsScore);
        Assert.Equal(1246, summary.ResponsesCount);
        Assert.Equal(3.91m, summary.CsatAvg);
    }

    [Fact]
    public async Task Post_creates_contact_with_201_and_location()
    {
        var client = await ClientAsync();

        var response = await client.PostAsJsonAsync("/api/contacts",
            new { name = "Novo Contato", email = "novo@exemplo.com.br", segment = "Plano Fit" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        var body = await response.Content.ReadFromJsonAsync<ContactDto>();
        Assert.NotNull(body);
        Assert.True(body!.Id > 0);
        Assert.Equal("novo@exemplo.com.br", body.Email);
    }

    [Fact]
    public async Task Post_duplicate_email_returns_409_with_error_body()
    {
        var client = await ClientAsync();
        var payload = new { name = "A", email = "dup@exemplo.com.br", segment = (string?)null };
        await client.PostAsJsonAsync("/api/contacts", payload);

        var response = await client.PostAsJsonAsync("/api/contacts",
            new { name = "B", email = "DUP@exemplo.com.br", segment = (string?)null });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.False(string.IsNullOrWhiteSpace(error!.Error));
    }

    [Fact]
    public async Task Post_missing_email_returns_400_with_error_body()
    {
        var client = await ClientAsync();

        var response = await client.PostAsJsonAsync("/api/contacts", new { name = "Sem Email" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.Equal("email é obrigatório.", error!.Error);
    }

    [Fact]
    public async Task Post_invalid_email_returns_400_with_error_body()
    {
        var client = await ClientAsync();

        var response = await client.PostAsJsonAsync("/api/contacts",
            new { name = "X", email = "nao-eh-email" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.Equal("email tem formato inválido.", error!.Error);
    }

    [Fact]
    public async Task Delete_hides_contact_returns_404_and_frees_email()
    {
        var client = await ClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/contacts",
            new { name = "Temp", email = "temp@exemplo.com.br" })).Content.ReadFromJsonAsync<ContactDto>();

        var delete = await client.DeleteAsync($"/api/contacts/{created!.Id}");
        var get = await client.GetAsync($"/api/contacts/{created.Id}");
        var recreate = await client.PostAsJsonAsync("/api/contacts",
            new { name = "Temp2", email = "temp@exemplo.com.br" });

        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
        Assert.Equal(HttpStatusCode.Created, recreate.StatusCode);
    }

    [Theory]
    [InlineData("/api/contacts?page=0", "page deve ser >= 1.")]
    [InlineData("/api/contacts?pageSize=101", "pageSize deve estar entre 1 e 100.")]
    public async Task List_with_invalid_pagination_returns_400(string url, string expectedError)
    {
        var client = await ClientAsync();

        var response = await client.GetAsync(url);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.Equal(expectedError, error!.Error);
    }

    [Fact]
    public async Task Get_responses_of_deleted_contact_returns_404()
    {
        var client = await ClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/contacts",
            new { name = "Temp", email = "hist@exemplo.com.br" })).Content.ReadFromJsonAsync<ContactDto>();
        await client.DeleteAsync($"/api/contacts/{created!.Id}");

        var response = await client.GetAsync($"/api/contacts/{created.Id}/responses");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Get_responses_returns_joined_survey_fields()
    {
        var client = await ClientAsync();

        var responses = await client.GetFromJsonAsync<List<ContactResponseDto>>("/api/contacts/1/responses");

        Assert.NotNull(responses);
        Assert.NotEmpty(responses!);
        Assert.All(responses!, r => Assert.False(string.IsNullOrWhiteSpace(r.SurveyName)));
    }
}
