using BirMuhendisinGunlugu.Application.DTOs.Projects;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Projects.Queries.GetAll;

public record GetAllProjectsQuery(string UserId) : IRequest<List<ProjectDto>>;
