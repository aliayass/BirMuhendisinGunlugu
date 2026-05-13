using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Dictionary.Commands.Create;
public record CreateDictionaryTermCommand(string Term, string Definition, string Category) : IRequest<DictionaryTermDto>;
