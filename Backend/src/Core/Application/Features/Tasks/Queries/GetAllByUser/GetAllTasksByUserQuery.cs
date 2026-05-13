using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetAllByUser;

public record GetAllTasksByUserQuery(string UserId) : IRequest<List<TaskDto>>;
