using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetAllByUser;

public class GetAllTasksByUserQueryHandler : IRequestHandler<GetAllTasksByUserQuery, List<TaskDto>>
{
    private readonly ITaskRepository _taskRepository;
    public GetAllTasksByUserQueryHandler(ITaskRepository taskRepository) => _taskRepository = taskRepository;
    public Task<List<TaskDto>> Handle(GetAllTasksByUserQuery request, CancellationToken ct)
        => _taskRepository.GetAllByUserAsync(request.UserId, ct);
}
