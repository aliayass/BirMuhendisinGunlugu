using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetByProject;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;
    public TasksController(IMediator mediator) => _mediator = mediator;

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetByProject(Guid projectId)
        => Ok(await _mediator.Send(new GetTasksByProjectQuery(projectId)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        var result = await _mediator.Send(new CreateTaskCommand(dto.Title, dto.Description, dto.ProjectId));
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var result = await _mediator.Send(new BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update.UpdateTaskCommand(id, dto.Title, dto.Description, dto.Status));
        return Ok(result);
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        var result = await _mediator.Send(new BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update.ToggleTaskCommand(id));
        return Ok(result);
    }
}
