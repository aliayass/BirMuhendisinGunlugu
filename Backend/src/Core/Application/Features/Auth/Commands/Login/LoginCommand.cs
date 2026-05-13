using BirMuhendisinGunlugu.Application.DTOs.Auth;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponseDto>;
