using BirMuhendisinGunlugu.Application.DTOs.Blog;
using BirMuhendisinGunlugu.Application.Interfaces.Blog;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Blog.Commands.Create;
public class CreateBlogPostCommandHandler : IRequestHandler<CreateBlogPostCommand, BlogPostDto>
{
    private readonly IBlogRepository _repository;
    public CreateBlogPostCommandHandler(IBlogRepository repository) => _repository = repository;
    public Task<BlogPostDto> Handle(CreateBlogPostCommand request, CancellationToken ct)
        => _repository.CreateAsync(request.Title, request.Content, request.UserId, ct);
}
