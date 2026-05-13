using BirMuhendisinGunlugu.Application.DTOs.Auth;

namespace BirMuhendisinGunlugu.Application.Interfaces.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(string firstName, string lastName, string email, string password);
    Task<AuthResponseDto> LoginAsync(string email, string password);
}
