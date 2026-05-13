using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Dictionary.Queries.GetAll;
public record GetAllDictionaryTermsQuery() : IRequest<List<DictionaryTermDto>>;
