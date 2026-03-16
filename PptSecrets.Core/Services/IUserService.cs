using PptSecrets.Core.Entities;
using PptSecrets.Core.Models;

namespace PptSecrets.Core.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);

    Task<bool> findPermission(string userEmail, Guid pptId);
    
    Task RegisterAsync(string email, Language lang);
    Task<User> VerifyEmailAsync(string email, string password, string code, string role = "User");

    Task<string?> AuthenticateAsync(string email, string password);
}