using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
using BirMuhendisinGunlugu.Application.Interfaces.Dictionary;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.Dictionary.Commands.Create;
public class CreateDictionaryTermCommandHandler : IRequestHandler<CreateDictionaryTermCommand, DictionaryTermDto>
{
    private readonly IDictionaryRepository _repository;
    public CreateDictionaryTermCommandHandler(IDictionaryRepository repository) => _repository = repository;
    public Task<DictionaryTermDto> Handle(CreateDictionaryTermCommand request, CancellationToken ct)
        => _repository.CreateAsync(request.Term, request.Definition, request.Category, ct);
}
