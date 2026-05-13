using BirMuhendisinGunlugu.Application.DTOs.Journals;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Journals.Commands.Create;

public record CreateJournalCommand(string Title, string Content, string Mood, string UserId) 
    : IRequest<JournalDto>;
