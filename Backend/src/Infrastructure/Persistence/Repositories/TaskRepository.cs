using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using BirMuhendisinGunlugu.Domain.Entities;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    private static TaskDto ToDto(TaskItem t, string? projectName = null) =>
        new(t.Id, t.Title, t.Description, t.Status, t.ProjectId, t.CreatedAt, t.UpdatedAt, t.Priority, t.DueDate, projectName);

    public async Task<List<TaskDto>> GetAllByUserAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Tasks
            .Include(t => t.Project)
            .Where(t => t.Project.UserId == userId && !t.IsDeleted && !t.Project.IsDeleted)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto(t.Id, t.Title, t.Description, t.Status, t.ProjectId, t.CreatedAt, t.UpdatedAt, t.Priority, t.DueDate, t.Project.Name))
            .ToListAsync(ct);
    }

    public async Task<TaskDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Görev bulunamadı: {id}");

        return ToDto(task, task.Project?.Name);
    }

    public async Task<List<TaskDto>> GetByProjectAsync(Guid projectId, CancellationToken ct = default)
    {
        return await _context.Tasks
            .Where(t => t.ProjectId == projectId && !t.IsDeleted)
            .OrderBy(t => t.CreatedAt)
            .Select(t => new TaskDto(t.Id, t.Title, t.Description, t.Status, t.ProjectId, t.CreatedAt, t.UpdatedAt, t.Priority, t.DueDate, null))
            .ToListAsync(ct);
    }

    public async Task<TaskDto> CreateAsync(string title, string description, Guid projectId, string priority = "Medium", DateTime? dueDate = null, CancellationToken ct = default)
    {
        var task = new TaskItem
        {
            Title = title,
            Description = description,
            ProjectId = projectId,
            Status = "Todo",
            Priority = priority,
            DueDate = dueDate
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(ct);

        return ToDto(task);
    }

    public async Task<TaskDto> UpdateAsync(Guid id, string title, string description, string status, string priority = "Medium", DateTime? dueDate = null, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Görev bulunamadı: {id}");

        task.Title = title;
        task.Description = description;
        task.Status = status;
        task.Priority = priority;
        task.DueDate = dueDate;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return ToDto(task);
    }

    public async Task<TaskDto> UpdateStatusAsync(Guid id, string status, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Görev bulunamadı: {id}");

        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return ToDto(task);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Görev bulunamadı: {id}");

        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }
}
