using BirMuhendisinGunlugu.Application.DTOs.Dictionary;
namespace BirMuhendisinGunlugu.Application.Interfaces.Dictionary;
public interface IDictionaryRepository
{
    Task<List<DictionaryTermDto>> GetAllAsync(CancellationToken ct = default);
    Task<DictionaryTermDto> CreateAsync(string term, string definition, string category, CancellationToken ct = default);
}
