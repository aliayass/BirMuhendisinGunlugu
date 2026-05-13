using BirMuhendisinGunlugu.Application.DTOs.Journals;
using BirMuhendisinGunlugu.Application.Interfaces.Journals;
using BirMuhendisinGunlugu.Domain.Entities;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class JournalRepository : IJournalRepository
{
    private readonly ApplicationDbContext _context;

    public JournalRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<JournalDto>> GetAllByUserAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Journals
            .Where(j => j.UserId == userId && !j.IsDeleted)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new JournalDto(j.Id, j.Title, j.Content, j.Mood, j.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<JournalDto> CreateAsync(string title, string content, string mood, string userId, CancellationToken ct = default)
    {
        var journal = new Journal
        {
            Title = title,
            Content = content,
            Mood = mood,
            UserId = userId
        };

        _context.Journals.Add(journal);
        await _context.SaveChangesAsync(ct);

        return new JournalDto(journal.Id, journal.Title, journal.Content, journal.Mood, journal.CreatedAt);
    }
}
