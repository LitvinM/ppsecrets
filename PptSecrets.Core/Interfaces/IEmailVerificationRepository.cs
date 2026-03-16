
using PptSecrets.Core.Entities;

namespace PptSecrets.Core.Interfaces;

public interface IEmailVerificationRepository : IRepositoryBase<EmailVerification>
{
    Task<EmailVerification?> GetLatestByEmailAsync(string email);
}