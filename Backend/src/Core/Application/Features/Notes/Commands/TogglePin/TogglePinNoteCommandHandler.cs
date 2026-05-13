using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.TogglePin;

public class TogglePinNoteCommandHandler : IRequestHandler<TogglePinNoteCommand, NoteDto>
{
    private readonly INoteRepository _noteRepository;
    public TogglePinNoteCommandHandler(INoteRepository noteRepository) => _noteRepository = noteRepository;
    public Task<NoteDto> Handle(TogglePinNoteCommand request, CancellationToken ct)
        => _noteRepository.TogglePinAsync(request.Id, request.UserId, ct);
}
