using PptSecrets.Core.Models;

namespace PptSecrets.Core.Services;

public interface IEmailVerificationService
{
    Task SendVerificationCodeAsync(string email, Language lang);
    Task<bool> VerifyCodeAsync(string email, string code);
}