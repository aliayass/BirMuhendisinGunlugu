using BirMuhendisinGunlugu.Application.DTOs.Projects;

namespace BirMuhendisinGunlugu.Application.Interfaces.Projects;

public interface IProjectRepository
{
    Task<List<ProjectDto>> GetAllByUserAsync(string userId, CancellationToken ct = default);
    Task<ProjectDto> GetByIdAsync(Guid id, string userId, CancellationToken ct = default);
    Task<ProjectDto> CreateAsync(string name, string description, string userId, CancellationToken ct = default);
    Task<ProjectDto> UpdateAsync(Guid id, string name, string description, string userId, CancellationToken ct = default);
    Task DeleteAsync(Guid id, string userId, CancellationToken ct = default);
}
