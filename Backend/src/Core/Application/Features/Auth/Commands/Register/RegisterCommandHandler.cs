using BirMuhendisinGunlugu.Application.DTOs.Auth;
using BirMuhendisinGunlugu.Application.Interfaces.Auth;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IAuthService _authService;

    public RegisterCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
        => _authService.RegisterAsync(request.FirstName, request.LastName, request.Email, request.Password);
}
