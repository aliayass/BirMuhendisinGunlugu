using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Create;

public record CreateTaskCommand(string Title, string Description, Guid ProjectId, string Priority = "Medium", DateTime? DueDate = null) : IRequest<TaskDto>;
