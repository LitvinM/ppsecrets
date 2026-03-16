# Используем образ с SDK для сборки проекта
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файлы проектов и восстанавливаем зависимости
# Убедись, что пути совпадают с твоими названиями папок!
COPY ["PptSecrets/PptSecrets.csproj", "PptSecrets/"]
COPY ["PptSecrets.Core/PptSecrets.Core.csproj", "PptSecrets.Core/"]
COPY ["PptSecrets.DataAccess/PptSecrets.DataAccess.csproj", "PptSecrets.DataAccess/"]
RUN dotnet restore "PptSecrets/PptSecrets.csproj"

# Копируем весь остальной код и собираем
COPY . .
WORKDIR "/src/PptSecrets"
RUN dotnet publish "PptSecrets.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Используем легкий образ только с runtime для запуска
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Указываем порт, который слушает приложение (по умолчанию в .NET 8 это 8080)
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "PptSecrets.dll"]