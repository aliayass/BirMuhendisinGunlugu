using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Queries.GetByProject;

public record GetTasksByProjectQuery(Guid ProjectId) : IRequest<List<TaskDto>>;
