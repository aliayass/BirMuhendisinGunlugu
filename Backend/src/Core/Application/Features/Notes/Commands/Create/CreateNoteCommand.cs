using BirMuhendisinGunlugu.Application.DTOs.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.Create;

public record CreateNoteCommand(string Title, string Content, Guid? ParentId, string UserId, string Tags = "", string Category = "") : IRequest<NoteDto>;
