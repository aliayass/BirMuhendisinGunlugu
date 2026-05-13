using BirMuhendisinGunlugu.Application.DTOs.Dashboard;
using BirMuhendisinGunlugu.Application.Interfaces.Dashboard;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Dashboard.Queries;

public record GetDashboardChartsQuery(string UserId, int Days = 7) : IRequest<DashboardChartsDto>;

public class GetDashboardChartsQueryHandler : IRequestHandler<GetDashboardChartsQuery, DashboardChartsDto>
{
    private readonly IDashboardRepository _dashboardRepository;

    public GetDashboardChartsQueryHandler(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardChartsDto> Handle(GetDashboardChartsQuery request, CancellationToken cancellationToken)
    {
        return await _dashboardRepository.GetChartsAsync(request.UserId, request.Days, cancellationToken);
    }
}
