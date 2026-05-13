namespace BirMuhendisinGunlugu.Application.Interfaces.Auth;

public interface IJwtService
{
    string GenerateToken(string userId, string email, string role);
    string GenerateRefreshToken();
}
