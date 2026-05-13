using BirMuhendisinGunlugu.Application.DTOs.Notes;

namespace BirMuhendisinGunlugu.Application.Interfaces.Notes;

public interface INoteRepository
{
    Task<List<NoteDto>> GetAllByUserAsync(string userId, CancellationToken ct = default);
    Task<NoteDto> GetByIdAsync(Guid id, string userId, CancellationToken ct = default);
    Task<NoteDto> CreateAsync(string title, string content, Guid? parentId, string userId, string tags = "", string category = "", CancellationToken ct = default);
    Task<NoteDto> UpdateAsync(Guid id, string title, string content, string userId, string tags = "", string category = "", CancellationToken ct = default);
    Task<NoteDto> TogglePinAsync(Guid id, string userId, CancellationToken ct = default);
    Task DeleteAsync(Guid id, string userId, CancellationToken ct = default);
}
