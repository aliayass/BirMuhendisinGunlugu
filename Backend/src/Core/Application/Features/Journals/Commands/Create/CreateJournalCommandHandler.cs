using BirMuhendisinGunlugu.Application.DTOs.Journals;
using BirMuhendisinGunlugu.Application.Interfaces.Journals;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Journals.Commands.Create;

public class CreateJournalCommandHandler : IRequestHandler<CreateJournalCommand, JournalDto>
{
    private readonly IJournalRepository _journalRepository;

    public CreateJournalCommandHandler(IJournalRepository journalRepository)
    {
        _journalRepository = journalRepository;
    }

    public Task<JournalDto> Handle(CreateJournalCommand request, CancellationToken cancellationToken)
        => _journalRepository.CreateAsync(request.Title, request.Content, request.Mood, request.UserId, cancellationToken);
}
