using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update;

public record UpdateTaskCommand(Guid Id, string Title, string Description, string Status) : IRequest<TaskDto>;
