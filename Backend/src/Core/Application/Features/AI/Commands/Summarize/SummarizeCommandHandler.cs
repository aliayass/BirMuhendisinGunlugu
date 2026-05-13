using BirMuhendisinGunlugu.Application.DTOs.AI;
using BirMuhendisinGunlugu.Application.Interfaces.AI;
using MediatR;
namespace BirMuhendisinGunlugu.Application.Features.AI.Commands.Summarize;
public class SummarizeCommandHandler : IRequestHandler<SummarizeCommand, AIResponseDto>
{
    private readonly IAIService _aiService;
    public SummarizeCommandHandler(IAIService aiService) => _aiService = aiService;
    public async Task<AIResponseDto> Handle(SummarizeCommand request, CancellationToken ct)
        => new AIResponseDto(await _aiService.SummarizeNoteAsync(request.Content, ct));
}
