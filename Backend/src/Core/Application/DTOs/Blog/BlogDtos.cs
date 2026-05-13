namespace BirMuhendisinGunlugu.Application.DTOs.Blog;
public record BlogPostDto(Guid Id, string Title, string Content, string UserId, DateTime CreatedAt);
public record CreateBlogPostDto(string Title, string Content);
