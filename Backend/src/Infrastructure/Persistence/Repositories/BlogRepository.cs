using BirMuhendisinGunlugu.Application.DTOs.Blog;
using BirMuhendisinGunlugu.Application.Interfaces.Blog;
using BirMuhendisinGunlugu.Domain.Entities;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class BlogRepository : IBlogRepository
{
    private readonly ApplicationDbContext _context;
    public BlogRepository(ApplicationDbContext context) => _context = context;

    public async Task<List<BlogPostDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.BlogPosts
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BlogPostDto(b.Id, b.Title, b.Content, b.UserId, b.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<BlogPostDto> CreateAsync(string title, string content, string userId, CancellationToken ct = default)
    {
        var entity = new BlogPost { Title = title, Content = content, UserId = userId };
        _context.BlogPosts.Add(entity);
        await _context.SaveChangesAsync(ct);
        return new BlogPostDto(entity.Id, entity.Title, entity.Content, entity.UserId, entity.CreatedAt);
    }
}
