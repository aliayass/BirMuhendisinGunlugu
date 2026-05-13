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

        var totalNotes = allNotes.Count();
        var completedTasks = allTasks.Count(t => t.Status == "Done");
        var activeProjects = allProjects.Count();
        
        // Blog kısmı statik "0" kalacak (kullanıcı isteği doğrultusunda)
        var blogReadCount = 0;

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
            blogReadCount,
            recentNotes,
            pendingTasks
        );
    }
}
