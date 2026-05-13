namespace BirMuhendisinGunlugu.Application.DTOs.Projects;

public record ProjectDto(Guid Id, string Name, string Description, DateTime CreatedAt);
public record CreateProjectDto(string Name, string Description);
public record UpdateProjectDto(string Name, string Description);

public record TaskDto(Guid Id, string Title, string Description, string Status, Guid ProjectId, DateTime CreatedAt, DateTime? UpdatedAt = null, string Priority = "Medium", DateTime? DueDate = null, string? ProjectName = null);
public record CreateTaskDto(string Title, string Description, Guid ProjectId, string Priority = "Medium", DateTime? DueDate = null);
public record UpdateTaskDto(string Title, string Description, string Status, string Priority = "Medium", DateTime? DueDate = null);
public record UpdateTaskStatusDto(string Status);
