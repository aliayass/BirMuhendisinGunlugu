using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using BirMuhendisinGunlugu.Domain.Entities;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class NoteRepository : INoteRepository
{
    private readonly ApplicationDbContext _context;

    public NoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    private static NoteDto ToDto(Note n) =>
        new(n.Id, n.Title, n.Content, n.ParentId, n.CreatedAt, n.UpdatedAt, n.IsPinned, n.Tags, n.Category);

    public async Task<List<NoteDto>> GetAllByUserAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Notes
            .Where(n => n.UserId == userId && !n.IsDeleted)
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.CreatedAt)
            .Select(n => new NoteDto(n.Id, n.Title, n.Content, n.ParentId, n.CreatedAt, n.UpdatedAt, n.IsPinned, n.Tags, n.Category))
            .ToListAsync(ct);
    }

    public async Task<NoteDto> GetByIdAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId && !n.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Not bulunamadı: {id}");
        return ToDto(note);
    }

    public async Task<NoteDto> CreateAsync(string title, string content, Guid? parentId, string userId, string tags = "", string category = "", CancellationToken ct = default)
    {
        var note = new Note { Title = title, Content = content, ParentId = parentId, UserId = userId, Tags = tags, Category = category };
        _context.Notes.Add(note);
        await _context.SaveChangesAsync(ct);
        return ToDto(note);
    }

    public async Task<NoteDto> UpdateAsync(Guid id, string title, string content, string userId, string tags = "", string category = "", CancellationToken ct = default)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId && !n.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Not bulunamadı: {id}");

        note.Title = title;
        note.Content = content;
        note.Tags = tags;
        note.Category = category;
        note.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return ToDto(note);
    }

    public async Task<NoteDto> TogglePinAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId && !n.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Not bulunamadı: {id}");

        note.IsPinned = !note.IsPinned;
        note.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return ToDto(note);
    }

    public async Task DeleteAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId && !n.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Not bulunamadı: {id}");

        note.IsDeleted = true;
        note.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
}
