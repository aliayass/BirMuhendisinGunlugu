namespace BirMuhendisinGunlugu.Application.DTOs.Notes;

public record NoteDto(Guid Id, string Title, string Content, Guid? ParentId, DateTime CreatedAt, DateTime? UpdatedAt = null, bool IsPinned = false, string Tags = "", string Category = "");
public record CreateNoteDto(string Title, string Content, Guid? ParentId, string Tags = "", string Category = "");
public record UpdateNoteDto(Guid Id, string Title, string Content, string Tags = "", string Category = "");
