using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Features.Notes.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Notes.Commands.Delete;
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

    /// <summary>Tüm notları listele</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<NoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllNotesQuery(GetUserId())));

    /// <summary>Yeni not oluştur</summary>
    [HttpPost]
    [ProducesResponseType(typeof(NoteDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateNoteDto dto)
    {
        var result = await _mediator.Send(new CreateNoteCommand(dto.Title, dto.Content, dto.ParentId, GetUserId()));
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    /// <summary>Notu güncelle</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(NoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoteDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdateNoteCommand(id, dto.Title, dto.Content, GetUserId()));
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    /// <summary>Notu sil (soft delete)</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
