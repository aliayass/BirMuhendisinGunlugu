using BirMuhendisinGunlugu.Application.DTOs.Blog;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Blog.Commands.Create;
public record CreateBlogPostCommand(string Title, string Content, string UserId) : IRequest<BlogPostDto>;
