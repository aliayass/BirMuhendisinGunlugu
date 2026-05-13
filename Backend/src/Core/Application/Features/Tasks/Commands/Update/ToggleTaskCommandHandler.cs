using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update;

public class ToggleTaskCommandHandler : IRequestHandler<ToggleTaskCommand, TaskDto>
{
    private readonly ITaskRepository _repository;

    public ToggleTaskCommandHandler(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<TaskDto> Handle(ToggleTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _repository.GetByIdAsync(request.Id, cancellationToken);
        var newStatus = task.Status == "Done" ? "Todo" : "Done";

        return await _repository.UpdateAsync(request.Id, task.Title, task.Description, newStatus, task.Priority, task.DueDate, cancellationToken);
    }
}
