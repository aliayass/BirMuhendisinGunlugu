namespace BirMuhendisinGunlugu.Application.DTOs.Journals;

public record JournalDto(Guid Id, string Title, string Content, string Mood, DateTime CreatedAt);
public record CreateJournalDto(string Title, string Content, string Mood);
public record UpdateJournalDto(Guid Id, string Title, string Content, string Mood);
