using BirMuhendisinGunlugu.Application.DTOs.AI;
using BirMuhendisinGunlugu.Application.Interfaces.AI;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.AI.Commands.SuggestTags;

public class SuggestTagsCommandHandler : IRequestHandler<SuggestTagsCommand, AIResponseDto>
{
    private readonly IAIService _aiService;
    public SuggestTagsCommandHandler(IAIService aiService) => _aiService = aiService;
    public async Task<AIResponseDto> Handle(SuggestTagsCommand request, CancellationToken ct)
        => new AIResponseDto(await _aiService.SuggestTagsAsync(request.Content, ct));
}
