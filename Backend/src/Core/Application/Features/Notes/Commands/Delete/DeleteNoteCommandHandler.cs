using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.Delete;

public class DeleteNoteCommandHandler : IRequestHandler<DeleteNoteCommand>
{
    private readonly INoteRepository _noteRepository;
    public DeleteNoteCommandHandler(INoteRepository noteRepository) => _noteRepository = noteRepository;
    public Task Handle(DeleteNoteCommand request, CancellationToken ct)
        => _noteRepository.DeleteAsync(request.Id, request.UserId, ct);
}
