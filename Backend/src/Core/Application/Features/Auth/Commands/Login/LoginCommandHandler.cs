using BirMuhendisinGunlugu.Application.DTOs.Auth;
using BirMuhendisinGunlugu.Application.Interfaces.Auth;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        => _authService.LoginAsync(request.Email, request.Password);
}
