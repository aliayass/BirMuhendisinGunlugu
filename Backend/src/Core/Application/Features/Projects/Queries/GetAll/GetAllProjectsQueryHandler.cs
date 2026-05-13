using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Projects.Queries.GetAll;

public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, List<ProjectDto>>
{
    private readonly IProjectRepository _projectRepository;
    public GetAllProjectsQueryHandler(IProjectRepository projectRepository) => _projectRepository = projectRepository;
    public Task<List<ProjectDto>> Handle(GetAllProjectsQuery request, CancellationToken ct)
        => _projectRepository.GetAllByUserAsync(request.UserId, ct);
}
