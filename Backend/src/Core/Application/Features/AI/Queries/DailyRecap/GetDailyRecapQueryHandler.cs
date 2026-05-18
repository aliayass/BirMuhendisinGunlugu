using System.Text;
using BirMuhendisinGunlugu.Application.DTOs.AI;
using BirMuhendisinGunlugu.Application.Interfaces.AI;
using BirMuhendisinGunlugu.Application.Interfaces.Journals;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.AI.Queries.DailyRecap;

public class GetDailyRecapQueryHandler : IRequestHandler<GetDailyRecapQuery, DailyRecapDto>
{
    private readonly INoteRepository _noteRepo;
    private readonly ITaskRepository _taskRepo;
    private readonly IJournalRepository _journalRepo;
    private readonly IAIService _aiService;

    public GetDailyRecapQueryHandler(
        INoteRepository noteRepo,
        ITaskRepository taskRepo,
        IJournalRepository journalRepo,
        IAIService aiService)
    {
        _noteRepo = noteRepo;
        _taskRepo = taskRepo;
        _journalRepo = journalRepo;
        _aiService = aiService;
    }

    public async Task<DailyRecapDto> Handle(GetDailyRecapQuery request, CancellationToken ct)
    {
        var date = (request.Date ?? DateTime.UtcNow).Date;
        var nextDate = date.AddDays(1);

        var notes = await _noteRepo.GetAllByUserAsync(request.UserId, ct);
        var tasks = await _taskRepo.GetAllByUserAsync(request.UserId, ct);
        var journals = await _journalRepo.GetAllByUserAsync(request.UserId, ct);

        var dayNotes = notes.Where(n => n.CreatedAt >= date && n.CreatedAt < nextDate).ToList();
        var dayJournals = journals.Where(j => j.CreatedAt >= date && j.CreatedAt < nextDate).ToList();
        var dayCompletedTasks = tasks.Where(t =>
            t.Status == "Done" && t.UpdatedAt.HasValue &&
            t.UpdatedAt.Value >= date && t.UpdatedAt.Value < nextDate).ToList();

        var items = new List<DailyRecapItem>();
        items.AddRange(dayJournals.Select(j => new DailyRecapItem("Journal", j.Title, Truncate(j.Content, 160))));
        items.AddRange(dayNotes.Select(n => new DailyRecapItem("Note", n.Title, Truncate(n.Content, 160))));
        items.AddRange(dayCompletedTasks.Select(t => new DailyRecapItem("Task", t.Title, "Tamamlandı")));

        if (items.Count == 0)
        {
            return new DailyRecapDto(date.ToString("yyyy-MM-dd"),
                "Bu gün için kayıtlı içerik bulunamadı.", 0, 0, 0, items);
        }

        var prompt = new StringBuilder();
        prompt.AppendLine($"Tarih: {date:dd MMMM yyyy}");
        prompt.AppendLine();
        if (dayJournals.Count > 0)
        {
            prompt.AppendLine("## Günlük girişleri:");
            foreach (var j in dayJournals)
                prompt.AppendLine($"- ({j.Mood}) {j.Title}: {j.Content}");
            prompt.AppendLine();
        }
        if (dayNotes.Count > 0)
        {
            prompt.AppendLine("## Notlar:");
            foreach (var n in dayNotes)
                prompt.AppendLine($"- {n.Title}: {Truncate(n.Content, 300)}");
            prompt.AppendLine();
        }
        if (dayCompletedTasks.Count > 0)
        {
            prompt.AppendLine("## Tamamlanan görevler:");
            foreach (var t in dayCompletedTasks)
                prompt.AppendLine($"- {t.Title}");
        }

        string summary;
        try
        {
            summary = await _aiService.SummarizeNoteAsync(prompt.ToString(), ct);
        }
        catch (Exception ex)
        {
            summary = $"AI özeti alınamadı: {ex.Message}";
        }

        return new DailyRecapDto(
            date.ToString("yyyy-MM-dd"),
            summary,
            dayNotes.Count,
            dayCompletedTasks.Count,
            dayJournals.Count,
            items);
    }

    private static string Truncate(string s, int max)
        => string.IsNullOrEmpty(s) ? string.Empty : s.Length <= max ? s : s.Substring(0, max) + "...";
}
