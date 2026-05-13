using BirMuhendisinGunlugu.Application.DTOs.Journals;
using BirMuhendisinGunlugu.Application.Interfaces.Journals;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Journals.Queries.GetAll;

public class GetAllJournalsQueryHandler : IRequestHandler<GetAllJournalsQuery, List<JournalDto>>
{
    private readonly IJournalRepository _journalRepository;

    public GetAllJournalsQueryHandler(IJournalRepository journalRepository)
    {
        _journalRepository = journalRepository;
    }

    public Task<List<JournalDto>> Handle(GetAllJournalsQuery request, CancellationToken cancellationToken)
        => _journalRepository.GetAllByUserAsync(request.UserId, cancellationToken);
}
