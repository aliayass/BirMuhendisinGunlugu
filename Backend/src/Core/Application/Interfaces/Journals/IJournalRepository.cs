using BirMuhendisinGunlugu.Application.DTOs.Journals;

namespace BirMuhendisinGunlugu.Application.Interfaces.Journals;

public interface IJournalRepository
{
    Task<List<JournalDto>> GetAllByUserAsync(string userId, CancellationToken ct = default);
    Task<JournalDto> CreateAsync(string title, string content, string mood, string userId, CancellationToken ct = default);
}
