using BirMuhendisinGunlugu.Application.DTOs.Projects;

namespace BirMuhendisinGunlugu.Application.Interfaces.Projects;

public interface ITaskRepository
{
    Task<List<TaskDto>> GetAllByUserAsync(string userId, CancellationToken ct = default);
    Task<TaskDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<TaskDto>> GetByProjectAsync(Guid projectId, CancellationToken ct = default);
    Task<TaskDto> CreateAsync(string title, string description, Guid projectId, CancellationToken ct = default);
    Task<TaskDto> UpdateAsync(Guid id, string title, string description, string status, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
