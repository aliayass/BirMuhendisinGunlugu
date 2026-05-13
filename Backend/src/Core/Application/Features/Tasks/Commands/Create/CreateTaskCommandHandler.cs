using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Create;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly ITaskRepository _taskRepository;
    public CreateTaskCommandHandler(ITaskRepository taskRepository) => _taskRepository = taskRepository;
    public Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken ct)
        => _taskRepository.CreateAsync(request.Title, request.Description, request.ProjectId, request.Priority, request.DueDate, ct);
}
