using BirMuhendisinGunlugu.Application.DTOs.AI;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.AI.Commands.SuggestTags;

public record SuggestTagsCommand(string Content) : IRequest<AIResponseDto>;
