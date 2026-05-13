using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Update;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskDto>
{
    private readonly ITaskRepository _repository;

    public UpdateTaskCommandHandler(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<TaskDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        return await _repository.UpdateAsync(request.Id, request.Title, request.Description, request.Status, request.Priority, request.DueDate, cancellationToken);
    }
}
