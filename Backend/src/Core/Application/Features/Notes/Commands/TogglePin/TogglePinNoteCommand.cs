using BirMuhendisinGunlugu.Application.DTOs.Notes;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.TogglePin;

public record TogglePinNoteCommand(Guid Id, string UserId) : IRequest<NoteDto>;
