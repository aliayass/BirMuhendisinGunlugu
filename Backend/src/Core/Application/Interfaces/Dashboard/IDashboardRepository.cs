using BirMuhendisinGunlugu.Application.DTOs.Dashboard;

namespace BirMuhendisinGunlugu.Application.Interfaces.Dashboard;

public interface IDashboardRepository
{
    Task<DashboardChartsDto> GetChartsAsync(string userId, int days, CancellationToken ct = default);
}
