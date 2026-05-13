using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.DTOs.Projects;

namespace BirMuhendisinGunlugu.Application.DTOs.Dashboard;

public record DashboardSummaryDto(
    int TotalNotes,
    int CompletedTasks,
    int ActiveProjects,
    int BlogReadCount,
    List<NoteDto> RecentNotes,
    List<TaskDto> PendingTasks
);
