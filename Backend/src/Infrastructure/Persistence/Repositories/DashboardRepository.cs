using BirMuhendisinGunlugu.Application.DTOs.Dashboard;
using BirMuhendisinGunlugu.Application.Interfaces.Dashboard;
using BirMuhendisinGunlugu.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BirMuhendisinGunlugu.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public DashboardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardChartsDto> GetChartsAsync(string userId, int days, CancellationToken ct = default)
    {
        var clampedDays = days is 7 or 14 or 30 ? days : 7;
        var startDate = DateTime.UtcNow.Date.AddDays(-clampedDays + 1);

        // Tüm günleri dizi olarak hazırla
        var allDays = Enumerable.Range(0, clampedDays)
            .Select(i => startDate.AddDays(i))
            .ToList();

        // Notlar: kullanıcıya ait, silinmemiş, tarih aralığında
        var notesByDay = await _context.Notes
            .Where(n => n.UserId == userId && !n.IsDeleted && n.CreatedAt.Date >= startDate)
            .GroupBy(n => n.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        // Görevler: projeye bağlı kullanıcı görevleri, oluşturulma tarihi
        var tasksCreatedByDay = await _context.Tasks
            .Include(t => t.Project)
            .Where(t => t.Project.UserId == userId && !t.IsDeleted && !t.Project.IsDeleted && t.CreatedAt.Date >= startDate)
            .GroupBy(t => t.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        // Tamamlanan görevler: UpdatedAt bazlı (toggle tarihi)
        var tasksCompletedByDay = await _context.Tasks
            .Include(t => t.Project)
            .Where(t => t.Project.UserId == userId && !t.IsDeleted && !t.Project.IsDeleted
                        && t.Status == "Done" && t.UpdatedAt.HasValue && t.UpdatedAt.Value.Date >= startDate)
            .GroupBy(t => t.UpdatedAt!.Value.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        // Her günü 0 ile doldur
        var notesByDayFull = allDays.Select(d => new DashboardChartPointDto(
            d.ToString("yyyy-MM-dd"),
            notesByDay.FirstOrDefault(x => x.Date == d)?.Count ?? 0
        )).ToList();

        var tasksCreatedFull = allDays.Select(d => new DashboardChartPointDto(
            d.ToString("yyyy-MM-dd"),
            tasksCreatedByDay.FirstOrDefault(x => x.Date == d)?.Count ?? 0
        )).ToList();

        var tasksCompletedFull = allDays.Select(d => new DashboardChartPointDto(
            d.ToString("yyyy-MM-dd"),
            tasksCompletedByDay.FirstOrDefault(x => x.Date == d)?.Count ?? 0
        )).ToList();

        return new DashboardChartsDto(notesByDayFull, tasksCreatedFull, tasksCompletedFull, clampedDays);
    }
}
