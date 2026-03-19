using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;
using PptSecrets.Core.Services;
using PptSecrets.DataAccess;
using PptSecrets.DataAccess.Repository;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(connectionString) && 
    (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    // Приводим к единому стандарту для Uri
    var uriString = connectionString.Replace("postgresql://", "postgres://");
    var databaseUri = new Uri(uriString);
    var userInfo = databaseUri.UserInfo.Split(':');

    // Собираем строку в формате Npgsql
    // Если порт не указан в URI (databaseUri.Port < 0), ставим стандартный 5432
    var host = databaseUri.Host;
    var port = databaseUri.Port > 0 ? databaseUri.Port : 5432;
    var database = databaseUri.LocalPath.TrimStart('/');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
}

// Теперь Npgsql получит строку в формате: Host=dpg-d6ru...;Port=5432;Database=...
builder.Services.AddDbContext<PptDbContext>(options =>
    options.UseNpgsql(connectionString));

var supportedCultures = new[] { "en-US" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPptService, PptService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddHttpClient<IYooKassaService, YooKassaService>(); 
builder.Services.AddScoped<IYooKassaService, YooKassaService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        In = ParameterLocation.Header, Description = "JWT Token", Name = "Authorization", Type = SecuritySchemeType.Http, Scheme = "bearer"
    });
   
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"], ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

var ip = builder.Configuration["Frontip"]; 
var allowedOrigin = string.IsNullOrEmpty(ip) ? "http://localhost:3000" : ip;

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", b => 
    b.WithOrigins(allowedOrigin)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PptDbContext>();
    db.Database.EnsureCreated();

    var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
    if (!(await uow.Users.GetAllAsync()).Any())
    {
        var user = new User
        {
            Email = "15012010d@gmail.com",
            PasswordHash = UserService.HashPassword("Pass1234!!!"),
            Role = "Admin"
        };
        await uow.Users.AddAsync(user);
    }
}

app.UseCors("FrontendPolicy");

app.UseRequestLocalization(localizationOptions);

var imagesPath = Path.Combine(builder.Environment.ContentRootPath, "images");
var presPath = Path.Combine(builder.Environment.ContentRootPath, "presentations");

if (!Directory.Exists(imagesPath))
{
    Directory.CreateDirectory(imagesPath);
    Console.WriteLine($"Directory created: {imagesPath}");
}
if (!Directory.Exists(presPath))
{
    Directory.CreateDirectory(presPath);
    Console.WriteLine($"Directory created: {presPath}");
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagesPath),
    RequestPath = "/images"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(presPath),
    RequestPath = "/presentations"
});

app.UseMiddleware<PptSecrets.ExceptionHandler.ExceptionHandlerMiddleware>();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();