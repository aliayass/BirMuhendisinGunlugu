using BirMuhendisinGunlugu.Application.DTOs.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Queries.GetAll;

public record GetAllNotesQuery(string UserId) : IRequest<List<NoteDto>>;
