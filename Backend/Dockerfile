FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Presentation/WebAPI/BirMuhendisinGunlugu.WebAPI.csproj", "Presentation/WebAPI/"]
COPY ["src/Core/Application/BirMuhendisinGunlugu.Application.csproj", "Core/Application/"]
COPY ["src/Core/Domain/BirMuhendisinGunlugu.Domain.csproj", "Core/Domain/"]
COPY ["src/Infrastructure/Infrastructure/BirMuhendisinGunlugu.Infrastructure.csproj", "Infrastructure/Infrastructure/"]
COPY ["src/Infrastructure/Persistence/BirMuhendisinGunlugu.Persistence.csproj", "Infrastructure/Persistence/"]

RUN dotnet restore "Presentation/WebAPI/BirMuhendisinGunlugu.WebAPI.csproj"

COPY src/ .

RUN dotnet publish "Presentation/WebAPI/BirMuhendisinGunlugu.WebAPI.csproj" \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "BirMuhendisinGunlugu.WebAPI.dll"]
