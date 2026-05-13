using BirMuhendisinGunlugu.Application.DTOs.Blog;
using BirMuhendisinGunlugu.Application.Interfaces.Blog;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Blog.Queries.GetAll;
public class GetAllBlogPostsQueryHandler : IRequestHandler<GetAllBlogPostsQuery, List<BlogPostDto>>
{
    private readonly IBlogRepository _repository;
    public GetAllBlogPostsQueryHandler(IBlogRepository repository) => _repository = repository;
    public Task<List<BlogPostDto>> Handle(GetAllBlogPostsQuery request, CancellationToken ct)
        => _repository.GetAllAsync(ct);
}
