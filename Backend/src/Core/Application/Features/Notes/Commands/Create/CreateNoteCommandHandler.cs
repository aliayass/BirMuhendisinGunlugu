using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.Create;

public class CreateNoteCommandHandler : IRequestHandler<CreateNoteCommand, NoteDto>
{
    private readonly INoteRepository _noteRepository;
    public CreateNoteCommandHandler(INoteRepository noteRepository) => _noteRepository = noteRepository;
    public Task<NoteDto> Handle(CreateNoteCommand request, CancellationToken ct)
        => _noteRepository.CreateAsync(request.Title, request.Content, request.ParentId, request.UserId, request.Tags, request.Category, ct);
}
