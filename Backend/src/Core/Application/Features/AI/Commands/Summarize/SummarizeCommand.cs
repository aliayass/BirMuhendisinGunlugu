using BirMuhendisinGunlugu.Application.DTOs.AI;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.AI.Commands.Summarize;
public record SummarizeCommand(string Content) : IRequest<AIResponseDto>;
