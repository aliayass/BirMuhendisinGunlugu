namespace BirMuhendisinGunlugu.Application.DTOs.AI;

public record AISummarizeRequestDto(string Content);
public record AIExplainCodeRequestDto(string Code, string Language);
public record AISuggestTagsRequestDto(string Content);
public record AIResponseDto(string Result);

public record DailyRecapItem(string Type, string Title, string Snippet);
public record DailyRecapDto(string Date, string Summary, int NoteCount, int TaskCount, int JournalCount, List<DailyRecapItem> Items);
