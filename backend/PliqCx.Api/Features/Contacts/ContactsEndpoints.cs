using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using PliqCx.Api.Common;

namespace PliqCx.Api.Features.Contacts;

public static class ContactsModule
{
    public static IServiceCollection AddContactsModule(this IServiceCollection services)
    {
        services.AddScoped<IContactRepository, ContactRepository>();
        return services;
    }

    public static IEndpointRouteBuilder MapContactsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/contacts").WithTags("Contacts");

        group.MapGet("", List);
        group.MapGet("/{id:int}", Get);
        group.MapPost("", Create);
        group.MapPut("/{id:int}", Update);
        group.MapDelete("/{id:int}", Delete);
        group.MapGet("/{id:int}/responses", GetResponses);

        return app;
    }

    private static async Task<Results<Ok<ContactListResult>, BadRequest<ErrorResponse>>> List(
        string? search, int? page, int? pageSize, IContactRepository repo, CancellationToken ct)
    {
        var p = page ?? 1;
        var ps = pageSize ?? 20;
        if (p < 1)
            return TypedResults.BadRequest(new ErrorResponse("page deve ser >= 1."));
        if (ps is < 1 or > 100)
            return TypedResults.BadRequest(new ErrorResponse("pageSize deve estar entre 1 e 100."));

        var result = await repo.ListAsync(search, p, ps, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<Results<Ok<Contact>, NotFound>> Get(
        int id, IContactRepository repo, CancellationToken ct)
        => await repo.GetAsync(id, ct) is { } contact
            ? TypedResults.Ok(contact)
            : TypedResults.NotFound();

    private static async Task<Results<Created<Contact>, BadRequest<ErrorResponse>, Conflict<ErrorResponse>>> Create(
        ContactUpsertRequest req, IContactRepository repo, CancellationToken ct)
    {
        if (Validate(req) is { } error)
            return TypedResults.BadRequest(new ErrorResponse(error));

        try
        {
            var contact = await repo.CreateAsync(req.Name!.Trim(), req.Email!.Trim(), NormalizeSegment(req.Segment), ct);
            return TypedResults.Created($"/api/contacts/{contact.Id}", contact);
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return TypedResults.Conflict(new ErrorResponse("Já existe um contato com esse e-mail."));
        }
    }

    private static async Task<Results<Ok<Contact>, NotFound, BadRequest<ErrorResponse>, Conflict<ErrorResponse>>> Update(
        int id, ContactUpsertRequest req, IContactRepository repo, CancellationToken ct)
    {
        if (Validate(req) is { } error)
            return TypedResults.BadRequest(new ErrorResponse(error));

        try
        {
            var updated = await repo.UpdateAsync(id, req.Name!.Trim(), req.Email!.Trim(), NormalizeSegment(req.Segment), ct);
            return updated is null
                ? TypedResults.NotFound()
                : TypedResults.Ok(updated);
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return TypedResults.Conflict(new ErrorResponse("Já existe um contato com esse e-mail."));
        }
    }

    private static async Task<Results<NoContent, NotFound>> Delete(
        int id, IContactRepository repo, CancellationToken ct)
        => await repo.SoftDeleteAsync(id, ct)
            ? TypedResults.NoContent()
            : TypedResults.NotFound();

    private static async Task<Results<Ok<IReadOnlyList<ContactResponseItem>>, NotFound>> GetResponses(
        int id, IContactRepository repo, CancellationToken ct)
    {
        if (await repo.GetAsync(id, ct) is null)
            return TypedResults.NotFound();

        var responses = await repo.GetResponsesAsync(id, ct);
        return TypedResults.Ok(responses);
    }

    private static string? Validate(ContactUpsertRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return "name é obrigatório.";
        if (string.IsNullOrWhiteSpace(req.Email))
            return "email é obrigatório.";
        if (!new EmailAddressAttribute().IsValid(req.Email))
            return "email tem formato inválido.";
        return null;
    }

    private static string? NormalizeSegment(string? segment)
        => string.IsNullOrWhiteSpace(segment) ? null : segment.Trim();
}
