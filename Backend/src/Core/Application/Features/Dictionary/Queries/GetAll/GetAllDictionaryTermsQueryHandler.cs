using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
using BirMuhendisinGunlugu.Application.Interfaces.Dictionary;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Dictionary.Queries.GetAll;
public class GetAllDictionaryTermsQueryHandler : IRequestHandler<GetAllDictionaryTermsQuery, List<DictionaryTermDto>>
{
    private readonly IDictionaryRepository _repository;
    public GetAllDictionaryTermsQueryHandler(IDictionaryRepository repository) => _repository = repository;
    public Task<List<DictionaryTermDto>> Handle(GetAllDictionaryTermsQuery request, CancellationToken ct)
        => _repository.GetAllAsync(ct);
}
