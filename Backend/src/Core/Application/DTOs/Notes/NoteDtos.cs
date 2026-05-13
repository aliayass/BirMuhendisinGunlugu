namespace BirMuhendisinGunlugu.Application.DTOs.Notes;

public record NoteDto(Guid Id, string Title, string Content, Guid? ParentId, DateTime CreatedAt);
public record CreateNoteDto(string Title, string Content, Guid? ParentId);
public record UpdateNoteDto(Guid Id, string Title, string Content);
