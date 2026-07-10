using Microsoft.AspNetCore.Mvc;
using PliqCx.Api.Dtos;
using PliqCx.Api.Services;

namespace PliqCx.Api.Controllers;

[ApiController]
[Route("api/contacts")]
public sealed class ContactsController(IContactService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ContactDto>>> GetList(
        [FromQuery] ContactQuery query, CancellationToken ct)
        => Ok(await service.ListAsync(query, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContactDto>> GetById(int id, CancellationToken ct)
        => await service.GetAsync(id, ct) is { } contact ? Ok(contact) : NotFound();

    [HttpPost]
    public async Task<ActionResult<ContactDto>> Create(ContactRequest request, CancellationToken ct)
    {
        var contact = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = contact.Id }, contact);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ContactDto>> Update(int id, ContactRequest request, CancellationToken ct)
        => await service.UpdateAsync(id, request, ct) is { } contact ? Ok(contact) : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpGet("{id:int}/responses")]
    public async Task<ActionResult<IReadOnlyList<ContactResponseDto>>> GetResponses(int id, CancellationToken ct)
        => await service.GetResponsesAsync(id, ct) is { } responses ? Ok(responses) : NotFound();
}
