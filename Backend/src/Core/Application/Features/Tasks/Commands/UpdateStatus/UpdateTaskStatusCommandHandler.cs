using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.UpdateStatus;

public class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand, TaskDto>
{
    private readonly ITaskRepository _taskRepository;
    public UpdateTaskStatusCommandHandler(ITaskRepository taskRepository) => _taskRepository = taskRepository;
    public Task<TaskDto> Handle(UpdateTaskStatusCommand request, CancellationToken ct)
        => _taskRepository.UpdateStatusAsync(request.Id, request.Status, ct);
}
