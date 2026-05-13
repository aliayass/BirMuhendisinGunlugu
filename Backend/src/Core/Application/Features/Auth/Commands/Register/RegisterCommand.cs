using BirMuhendisinGunlugu.Application.DTOs.Auth;
using MediatR;

namespace BirMuhendisinGunlugu.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string FirstName, string LastName, string Email, string Password) 
    : IRequest<AuthResponseDto>;
