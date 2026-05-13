using BirMuhendisinGunlugu.Application.DTOs.Dashboard;
using BirMuhendisinGunlugu.Application.Features.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Dashboard özet verilerini getirir</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _mediator.Send(new GetDashboardSummaryQuery(userId));
        return Ok(result);
    }

    /// <summary>Dashboard chart verilerini getirir (7, 14 veya 30 gün)</summary>
    [HttpGet("charts")]
    [ProducesResponseType(typeof(DashboardChartsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCharts([FromQuery] int days = 7)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _mediator.Send(new GetDashboardChartsQuery(userId, days));
        return Ok(result);
    }
}
