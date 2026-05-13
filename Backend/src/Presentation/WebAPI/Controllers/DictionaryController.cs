using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
using BirMuhendisinGunlugu.Application.Features.Dictionary.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Dictionary.Queries.GetAll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DictionaryController : ControllerBase
{
    private readonly IMediator _mediator;
    public DictionaryController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllDictionaryTermsQuery()));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDictionaryTermDto dto)
    {
        var result = await _mediator.Send(new CreateDictionaryTermCommand(dto.Term, dto.Definition, dto.Category));
        return Ok(result);
    }
}
