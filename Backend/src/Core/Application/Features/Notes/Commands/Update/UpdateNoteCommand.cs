using BirMuhendisinGunlugu.Application.DTOs.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.Update;

public record UpdateNoteCommand(Guid Id, string Title, string Content, string UserId) : IRequest<NoteDto>;
