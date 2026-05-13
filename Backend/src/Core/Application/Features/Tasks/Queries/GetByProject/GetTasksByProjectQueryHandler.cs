using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetByProject;

public class GetTasksByProjectQueryHandler : IRequestHandler<GetTasksByProjectQuery, List<TaskDto>>
{
    private readonly ITaskRepository _taskRepository;
    public GetTasksByProjectQueryHandler(ITaskRepository taskRepository) => _taskRepository = taskRepository;
    public Task<List<TaskDto>> Handle(GetTasksByProjectQuery request, CancellationToken ct)
        => _taskRepository.GetByProjectAsync(request.ProjectId, ct);
}
