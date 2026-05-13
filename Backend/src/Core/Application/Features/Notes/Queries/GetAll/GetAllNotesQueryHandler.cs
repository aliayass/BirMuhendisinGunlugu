using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Queries.GetAll;

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, List<NoteDto>>
{
    private readonly INoteRepository _noteRepository;
    public GetAllNotesQueryHandler(INoteRepository noteRepository) => _noteRepository = noteRepository;
    public Task<List<NoteDto>> Handle(GetAllNotesQuery request, CancellationToken ct)
        => _noteRepository.GetAllByUserAsync(request.UserId, ct);
}
