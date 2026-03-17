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

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

RUN mkdir -p /app/images
RUN mkdir -p /app/presentations

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "PptSecrets.dll"]