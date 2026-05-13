using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Delete;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand>
{
    private readonly ITaskRepository _taskRepository;
    public DeleteTaskCommandHandler(ITaskRepository taskRepository) => _taskRepository = taskRepository;
    public Task Handle(DeleteTaskCommand request, CancellationToken ct)
        => _taskRepository.DeleteAsync(request.Id, ct);
}
