using BirMuhendisinGunlugu.Application.DTOs.AI;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.AI.Queries.DailyRecap;

public record GetDailyRecapQuery(string UserId, DateTime? Date = null) : IRequest<DailyRecapDto>;
