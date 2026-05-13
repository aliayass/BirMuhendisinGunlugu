using BirMuhendisinGunlugu.Application.DTOs.Dashboard;
using BirMuhendisinGunlugu.Application.DTOs.Notes;
using BirMuhendisinGunlugu.Application.DTOs.Projects;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Dashboard.Queries;

public record GetDashboardSummaryQuery(string UserId) : IRequest<DashboardSummaryDto>;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly INoteRepository _noteRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly ITaskRepository _taskRepository;

    public GetDashboardSummaryQueryHandler(
        INoteRepository noteRepository,
        IProjectRepository projectRepository,
        ITaskRepository taskRepository)
    {
        _noteRepository = noteRepository;
        _projectRepository = projectRepository;
        _taskRepository = taskRepository;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var allNotes = await _noteRepository.GetAllByUserAsync(request.UserId, cancellationToken);
        var allProjects = await _projectRepository.GetAllByUserAsync(request.UserId, cancellationToken);
        var allTasks = await _taskRepository.GetAllByUserAsync(request.UserId, cancellationToken);

        var todayUtc = DateTime.UtcNow.Date;
        var weekAgoUtc = todayUtc.AddDays(-7);

        var totalNotes = allNotes.Count;
        var completedTasks = allTasks.Count(t => t.Status == "Done");
        var tasksPending = allTasks.Count(t => t.Status != "Done");
        var activeProjects = allProjects.Count;

        var notesThisWeek = allNotes.Count(n => n.CreatedAt >= weekAgoUtc);

        var totalTasks = allTasks.Count;
        var completionRate = totalTasks > 0
            ? (int)Math.Round(completedTasks * 100.0 / totalTasks)
            : 0;

        var tasksDoneToday = allTasks.Count(t =>
            t.Status == "Done" &&
            t.UpdatedAt.HasValue &&
            t.UpdatedAt.Value.Date == todayUtc);

        var recentNotes = allNotes
            .OrderByDescending(n => n.CreatedAt)
            .Take(4)
            .ToList();

        var pendingTasks = allTasks
            .Where(t => t.Status != "Done")
            .OrderByDescending(t => t.CreatedAt)
            .Take(4)
            .ToList();

        return new DashboardSummaryDto(
            totalNotes,
            completedTasks,
            activeProjects,
            BlogReadCount: 0,
            recentNotes,
            pendingTasks,
            tasksPending,
            notesThisWeek,
            completionRate,
            tasksDoneToday
        );
    }
}
