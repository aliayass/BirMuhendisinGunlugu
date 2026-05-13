using BirMuhendisinGunlugu.Application.DTOs.Journals;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Journals.Queries.GetAll;

public record GetAllJournalsQuery(string UserId) : IRequest<List<JournalDto>>;
