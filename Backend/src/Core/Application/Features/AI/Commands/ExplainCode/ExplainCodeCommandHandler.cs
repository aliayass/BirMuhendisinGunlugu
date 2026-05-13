using BirMuhendisinGunlugu.Application.DTOs.AI;
using BirMuhendisinGunlugu.Application.Interfaces.AI;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.AI.Commands.ExplainCode;
public class ExplainCodeCommandHandler : IRequestHandler<ExplainCodeCommand, AIResponseDto>
{
    private readonly IAIService _aiService;
    public ExplainCodeCommandHandler(IAIService aiService) => _aiService = aiService;
    public async Task<AIResponseDto> Handle(ExplainCodeCommand request, CancellationToken ct)
        => new AIResponseDto(await _aiService.ExplainCodeAsync(request.Code, request.Language, ct));
}
