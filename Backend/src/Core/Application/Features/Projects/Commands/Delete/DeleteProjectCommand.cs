using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Projects.Commands.Delete;

public record DeleteProjectCommand(Guid Id, string UserId) : IRequest;
