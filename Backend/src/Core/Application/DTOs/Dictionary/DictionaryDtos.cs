namespace BirMuhendisinGunlugu.Application.DTOs.Dictionary;
public record DictionaryTermDto(Guid Id, string Term, string Definition, string Category, DateTime CreatedAt);
public record CreateDictionaryTermDto(string Term, string Definition, string Category);
