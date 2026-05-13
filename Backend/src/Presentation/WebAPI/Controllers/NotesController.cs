using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Features.Notes.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Notes.Commands.Delete;
using BirMuhendisinGunlugu.Application.Features.Notes.Commands.TogglePin;
using BirMuhendisinGunlugu.Application.Features.Notes.Commands.Update;
using BirMuhendisinGunlugu.Application.Features.Notes.Queries.GetAll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly IMediator _mediator;
    public NotesController(IMediator mediator) => _mediator = mediator;
    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllNotesQuery(GetUserId())));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNoteDto dto)
    {
        var result = await _mediator.Send(new CreateNoteCommand(dto.Title, dto.Content, dto.ParentId, GetUserId(), dto.Tags, dto.Category));
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoteDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdateNoteCommand(id, dto.Title, dto.Content, GetUserId(), dto.Tags, dto.Category));
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPatch("{id:guid}/pin")]
    public async Task<IActionResult> TogglePin(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new TogglePinNoteCommand(id, GetUserId()));
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _mediator.Send(new DeleteNoteCommand(id, GetUserId()));
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }
}
