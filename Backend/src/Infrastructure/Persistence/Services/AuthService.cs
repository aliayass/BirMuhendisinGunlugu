using BirMuhendisinGunlugu.Application.DTOs.Auth;
using BirMuhendisinGunlugu.Application.Interfaces.Auth;
using BirMuhendisinGunlugu.Persistence.Identity;
using Microsoft.AspNetCore.Identity;

namespace BirMuhendisinGunlugu.Persistence.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtService _jwtService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtService jwtService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(string firstName, string lastName, string email, string password)
    {
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
            throw new InvalidOperationException("Bu e-posta adresi zaten kullanılıyor.");

        var user = new ApplicationUser
        {
            Email = email,
            UserName = email,
            FirstName = firstName,
            LastName = lastName
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";
        var accessToken = _jwtService.GenerateToken(user.Id, user.Email!, role);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponseDto(accessToken, refreshToken, user.Email!, $"{user.FirstName} {user.LastName}");
    }

    public async Task<AuthResponseDto> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email)
            ?? throw new UnauthorizedAccessException("Sistemde bu e-posta adresine ait kayıtlı bir kullanıcı bulunamadı.");

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: false);
        if (!result.Succeeded)
            throw new UnauthorizedAccessException("Girdiğiniz şifre hatalı, lütfen tekrar deneyin.");

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";
        var accessToken = _jwtService.GenerateToken(user.Id, user.Email!, role);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponseDto(accessToken, refreshToken, user.Email!, $"{user.FirstName} {user.LastName}");
    }
}
