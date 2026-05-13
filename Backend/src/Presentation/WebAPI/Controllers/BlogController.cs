using BirMuhendisinGunlugu.Application.DTOs.Blog;
using BirMuhendisinGunlugu.Application.Features.Blog.Commands.Create;
using BirMuhendisinGunlugu.Application.Features.Blog.Queries.GetAll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BirMuhendisinGunlugu.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BlogController : ControllerBase
{
    private readonly IMediator _mediator;
    public BlogController(IMediator mediator) => _mediator = mediator;
    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllBlogPostsQuery()));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogPostDto dto)
    {
        var result = await _mediator.Send(new CreateBlogPostCommand(dto.Title, dto.Content, GetUserId()));
        return Ok(result);
    }
}
