using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Tasks.Commands.Delete;

public record DeleteTaskCommand(Guid Id) : IRequest;
