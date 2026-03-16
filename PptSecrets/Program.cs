using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi;
using PptSecrets.Core.Interfaces;
using PptSecrets.Core.Services;
using PptSecrets.DataAccess;
using PptSecrets.DataAccess.Repository;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// ПРОВЕРКА: Если строка пустая или это URL от Render (начинается с postgres://)
if (string.IsNullOrEmpty(connectionString))
{
    // Попробуем взять системную переменную DATABASE_URL (Render часто ее дает)
    connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
}

if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("postgres://"))
{
    // Парсим URL формат в формат Npgsql
    var databaseUri = new Uri(connectionString);
    var userInfo = databaseUri.UserInfo.Split(':');

    connectionString = $"Host={databaseUri.Host};" +
                       $"Port={databaseUri.Port};" +
                       $"Database={databaseUri.LocalPath.TrimStart('/')};" +
                       $"Username={userInfo[0]};" +
                       $"Password={userInfo[1]};" +
                       $"SSL Mode=Require;Trust Server Certificate=true;";
}

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

var ip = builder.Configuration["frontip"];

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", b => b.WithOrigins(ip ?? "localhost:3000").AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PptDbContext>();
    db.Database.EnsureCreated();
}

app.UseRequestLocalization(localizationOptions);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "images")),
    RequestPath = "/images"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "presentations")),
    RequestPath = "/presentations"
});

app.UseMiddleware<PptSecrets.ExceptionHandler.ExceptionHandlerMiddleware>();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();