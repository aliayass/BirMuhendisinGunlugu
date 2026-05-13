using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update;

public record ToggleTaskCommand(Guid Id) : IRequest<TaskDto>;
