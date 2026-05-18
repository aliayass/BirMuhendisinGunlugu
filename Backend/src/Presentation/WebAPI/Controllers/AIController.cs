using BirMuhendisinGunlugu.Application.DTOs.AI;
using BirMuhendisinGunlugu.Application.Features.AI.Commands.ExplainCode;
using BirMuhendisinGunlugu.Application.Features.AI.Commands.SuggestTags;
using BirMuhendisinGunlugu.Application.Features.AI.Commands.Summarize;
using BirMuhendisinGunlugu.Application.Features.AI.Queries.DailyRecap;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IMediator _mediator;
    public AIController(IMediator mediator) => _mediator = mediator;
    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost("summarize")]
    public async Task<IActionResult> Summarize([FromBody] AISummarizeRequestDto dto)
        => Ok(await _mediator.Send(new SummarizeCommand(dto.Content)));

    [HttpPost("explain-code")]
    public async Task<IActionResult> ExplainCode([FromBody] AIExplainCodeRequestDto dto)
        => Ok(await _mediator.Send(new ExplainCodeCommand(dto.Code, dto.Language)));

    [HttpPost("suggest-tags")]
    public async Task<IActionResult> SuggestTags([FromBody] AISuggestTagsRequestDto dto)
        => Ok(await _mediator.Send(new SuggestTagsCommand(dto.Content)));

    [HttpGet("daily-recap")]
    public async Task<IActionResult> DailyRecap([FromQuery] DateTime? date = null)
        => Ok(await _mediator.Send(new GetDailyRecapQuery(GetUserId(), date)));
}
