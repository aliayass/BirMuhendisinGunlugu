using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.Update;

public class UpdateNoteCommandHandler : IRequestHandler<UpdateNoteCommand, NoteDto>
{
    private readonly INoteRepository _noteRepository;
    public UpdateNoteCommandHandler(INoteRepository noteRepository) => _noteRepository = noteRepository;
    public Task<NoteDto> Handle(UpdateNoteCommand request, CancellationToken ct)
        => _noteRepository.UpdateAsync(request.Id, request.Title, request.Content, request.UserId, request.Tags, request.Category, ct);
}
