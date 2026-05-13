using BirMuhendisinGunlugu.Application.Interfaces.Auth;
using BirMuhendisinGunlugu.Application.Interfaces.Blog;
using BirMuhendisinGunlugu.Application.Interfaces.Dictionary;
using BirMuhendisinGunlugu.Application.Interfaces.Journals;
using BirMuhendisinGunlugu.Application.Interfaces.Notes;
using BirMuhendisinGunlugu.Application.Interfaces.Projects;
using BirMuhendisinGunlugu.Persistence.Contexts;
using BirMuhendisinGunlugu.Persistence.Identity;
using BirMuhendisinGunlugu.Persistence.Repositories;
using BirMuhendisinGunlugu.Persistence.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BirMuhendisinGunlugu.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager<SignInManager<ApplicationUser>>()
            .AddDefaultTokenProviders();

        // Repository & Service kayıtları
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJournalRepository, JournalRepository>();
        services.AddScoped<INoteRepository, NoteRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IDictionaryRepository, DictionaryRepository>();
        services.AddScoped<IBlogRepository, BlogRepository>();

        return services;
    }
}
