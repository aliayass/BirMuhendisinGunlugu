namespace BirMuhendisinGunlugu.Application.Interfaces.AI;

public interface IAIService
{
    Task<string> SummarizeNoteAsync(string content, CancellationToken ct = default);
    Task<string> ExplainCodeAsync(string code, string language, CancellationToken ct = default);
    Task<string> SuggestTagsAsync(string content, CancellationToken ct = default);
}
