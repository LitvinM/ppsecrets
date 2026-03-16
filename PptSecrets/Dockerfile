FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["PptSecrets/PptSecrets.csproj", "PptSecrets/"]
RUN dotnet restore "PptSecrets/PptSecrets.csproj"
COPY . .
WORKDIR "/src/PptSecrets"
RUN dotnet build "PptSecrets.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PptSecrets.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PptSecrets.dll"]
