namespace BirMuhendisinGunlugu.Application.DTOs.AI;

public record AISummarizeRequestDto(string Content);
public record AIExplainCodeRequestDto(string Code, string Language);
public record AIResponseDto(string Result);
