using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Projects.Commands.Create;

public record CreateProjectCommand(string Name, string Description, string UserId) : IRequest<ProjectDto>;
