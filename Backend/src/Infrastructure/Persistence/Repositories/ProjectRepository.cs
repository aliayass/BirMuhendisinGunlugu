using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using BirMuhendisinGunlugu.Domain.Entities;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly ApplicationDbContext _context;

    public ProjectRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectDto>> GetAllByUserAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Projects
            .Where(p => p.UserId == userId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto(p.Id, p.Name, p.Description, p.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<ProjectDto> GetByIdAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Proje bulunamadı: {id}");
            
        return new ProjectDto(project.Id, project.Name, project.Description, project.CreatedAt);
    }

    public async Task<ProjectDto> CreateAsync(string name, string description, string userId, CancellationToken ct = default)
    {
        var project = new Project
        {
            Name = name,
            Description = description,
            UserId = userId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(ct);

        return new ProjectDto(project.Id, project.Name, project.Description, project.CreatedAt);
    }

    public async Task<ProjectDto> UpdateAsync(Guid id, string name, string description, string userId, CancellationToken ct = default)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Proje bulunamadı: {id}");

        project.Name = name;
        project.Description = description;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new ProjectDto(project.Id, project.Name, project.Description, project.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Proje bulunamadı: {id}");

        project.IsDeleted = true;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }
}
