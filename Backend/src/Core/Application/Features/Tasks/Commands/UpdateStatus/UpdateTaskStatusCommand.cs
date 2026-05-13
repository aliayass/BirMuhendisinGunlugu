using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.UpdateStatus;

public record UpdateTaskStatusCommand(Guid Id, string Status) : IRequest<TaskDto>;
