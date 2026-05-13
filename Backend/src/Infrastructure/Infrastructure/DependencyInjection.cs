using System.Text;
using BirMuhendisinGunlugu.Application.Interfaces.Auth;
using BirMuhendisinGunlugu.Application.Interfaces.AI;
using BirMuhendisinGunlugu.Application.Interfaces.Caching;
using BirMuhendisinGunlugu.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace BirMuhendisinGunlugu.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // JWT Authentication
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"]!))
                };
            });

        // Services
        services.AddScoped<IJwtService, JwtService>();
        services.AddHttpClient<IAIService, AIService>();
        services.AddSingleton<ICacheService, RedisCacheService>();

        return services;
    }
}
