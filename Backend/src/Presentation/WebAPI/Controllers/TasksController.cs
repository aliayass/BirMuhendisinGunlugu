using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Delete;
using BirMuhendisinGunlugu.Application.Features.Tasks.Commands.UpdateStatus;
using BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetAllByUser;
using BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetByProject;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;
    public TasksController(IMediator mediator) => _mediator = mediator;
    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllTasksByUserQuery(GetUserId())));

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetByProject(Guid projectId)
        => Ok(await _mediator.Send(new GetTasksByProjectQuery(projectId)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        var result = await _mediator.Send(new CreateTaskCommand(dto.Title, dto.Description, dto.ProjectId, dto.Priority, dto.DueDate));
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var result = await _mediator.Send(new BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update.UpdateTaskCommand(id, dto.Title, dto.Description, dto.Status, dto.Priority, dto.DueDate));
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdateTaskStatusCommand(id, dto.Status));
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        var result = await _mediator.Send(new BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update.ToggleTaskCommand(id));
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _mediator.Send(new DeleteTaskCommand(id));
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }
}
