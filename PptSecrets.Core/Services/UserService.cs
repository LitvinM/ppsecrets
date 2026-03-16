using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;
using PptSecrets.Core.Models;

namespace PptSecrets.Core.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _configuration;
    private readonly IEmailVerificationService _emailVerificationService;

    public UserService(IUnitOfWork uow, IEmailVerificationService emailVerificationService, IConfiguration configuration)
    {
        _uow = uow;
        _emailVerificationService = emailVerificationService;
        _configuration = configuration;
    }

    public async Task<User?> GetByIdAsync(Guid id) => await _uow.Users.GetByIdAsync(id);

    public async Task<User?> GetByEmailAsync(string email) => await _uow.Users.GetByEmailAsync(email);

    public async Task RegisterAsync(string email, Language lang)
    {
        var existingUser = await _uow.Users.GetByEmailAsync(email);
        if (existingUser != null) throw new Exception("User already exists");

        await SendEmailCode(email, lang);
    }

    public async Task<User> VerifyEmailAsync(string email, string password, string code, string role = "User")
    {
        var res = await _emailVerificationService.VerifyCodeAsync(email, code);

        if (!res)
        {
            throw new Exception("Code is not valid");
        }
        
        var user = new User
        {
            Email = email,
            PasswordHash = HashPassword(password),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        await _uow.Users.AddAsync(user);
        await _uow.SaveChangesAsync();

        await AuthenticateAsync(user.Email, user.PasswordHash);
        
        return user;
    }

    public async Task<string?> AuthenticateAsync(string email, string password)
    {
        var user = await _uow.Users.GetByEmailAsync(email);
        if (user == null || user.PasswordHash != HashPassword(password))
            return null;

        return GenerateJwtToken(user);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task SendEmailCode(string email, Language lang)
    {
        await _emailVerificationService.SendVerificationCodeAsync(email, lang);
        await Task.CompletedTask;
    }

    public async Task<bool> findPermission(string userEmail, Guid pptId)
    {
        var user = await _uow.Users.GetByEmailAsync(userEmail);

        return await _uow.UserPpts.findByUserPptId(user!.Id, pptId);
    }
}