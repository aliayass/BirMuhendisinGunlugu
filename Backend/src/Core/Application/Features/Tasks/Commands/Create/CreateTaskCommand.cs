using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Create;

public record CreateTaskCommand(string Title, string Description, Guid ProjectId) : IRequest<TaskDto>;
