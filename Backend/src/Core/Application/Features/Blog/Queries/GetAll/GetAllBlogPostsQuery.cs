using BirMuhendisinGunlugu.Application.DTOs.Blog;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Blog.Queries.GetAll;
public record GetAllBlogPostsQuery() : IRequest<List<BlogPostDto>>;
