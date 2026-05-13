using BirMuhendisinGunlugu.Application.DTOs.Journals;
using BirMuhendisinGunlugu.Application.Features.Journals.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Journals.Queries.GetAll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JournalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public JournalsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Kullanıcının tüm günlük girdilerini listele</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<JournalDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllJournalsQuery(GetUserId()));
        return Ok(result);
    }

    /// <summary>Yeni günlük girdisi oluştur</summary>
    [HttpPost]
    [ProducesResponseType(typeof(JournalDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateJournalDto dto)
    {
        var result = await _mediator.Send(new CreateJournalCommand(dto.Title, dto.Content, dto.Mood, GetUserId()));
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }
}
