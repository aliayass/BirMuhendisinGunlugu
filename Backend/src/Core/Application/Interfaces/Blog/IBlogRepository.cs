using BirMuhendisinGunlugu.Application.DTOs.Blog;
namespace BirMuhendisinGunlugu.Application.Interfaces.Blog;
public interface IBlogRepository
{
    Task<List<BlogPostDto>> GetAllAsync(CancellationToken ct = default);
    Task<BlogPostDto> CreateAsync(string title, string content, string userId, CancellationToken ct = default);
}
