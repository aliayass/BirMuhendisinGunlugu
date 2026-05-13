using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
using BirMuhendisinGunlugu.Application.Interfaces.Dictionary;
using BirMuhendisinGunlugu.Domain.Entities;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class DictionaryRepository : IDictionaryRepository
{
    private readonly ApplicationDbContext _context;
    public DictionaryRepository(ApplicationDbContext context) => _context = context;

    public async Task<List<DictionaryTermDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.DictionaryTerms
            .OrderBy(t => t.Term)
            .Select(t => new DictionaryTermDto(t.Id, t.Term, t.Definition, t.Category, t.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<DictionaryTermDto> CreateAsync(string term, string definition, string category, CancellationToken ct = default)
    {
        var entity = new DictionaryTerm { Term = term, Definition = definition, Category = category };
        _context.DictionaryTerms.Add(entity);
        await _context.SaveChangesAsync(ct);
        return new DictionaryTermDto(entity.Id, entity.Term, entity.Definition, entity.Category, entity.CreatedAt);
    }
}
