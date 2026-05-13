using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Projects.Commands.Create;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IProjectRepository _projectRepository;
    public CreateProjectCommandHandler(IProjectRepository projectRepository) => _projectRepository = projectRepository;
    public Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken ct)
        => _projectRepository.CreateAsync(request.Name, request.Description, request.UserId, ct);
}
