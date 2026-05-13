using BirMuhendisinGunlugu.Application.DTOs.AI;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.AI.Commands.ExplainCode;
public record ExplainCodeCommand(string Code, string Language) : IRequest<AIResponseDto>;
