using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Notes.Commands.Delete;

public record DeleteNoteCommand(Guid Id, string UserId) : IRequest;
