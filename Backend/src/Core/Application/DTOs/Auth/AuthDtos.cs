namespace BirMuhendisinGunlugu.Application.DTOs.Auth;

public record RegisterDto(string FirstName, string LastName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string AccessToken, string RefreshToken, string Email, string FullName);
