using BirMuhendisinGunlugu.Application.DTOs.AI;
using BirMuhendisinGunlugu.Application.Features.AI.Commands.ExplainCode;
using BirMuhendisinGunlugu.Application.Features.AI.Commands.Summarize;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IMediator _mediator;
    public AIController(IMediator mediator) => _mediator = mediator;

    [HttpPost("summarize")]
    public async Task<IActionResult> Summarize([FromBody] AISummarizeRequestDto dto)
        => Ok(await _mediator.Send(new SummarizeCommand(dto.Content)));

    [HttpPost("explain-code")]
    public async Task<IActionResult> ExplainCode([FromBody] AIExplainCodeRequestDto dto)
        => Ok(await _mediator.Send(new ExplainCodeCommand(dto.Code, dto.Language)));
}
