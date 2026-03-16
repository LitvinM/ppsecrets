using Microsoft.EntityFrameworkCore;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;

namespace PptSecrets.DataAccess.Repository;


public class EmailVerificationRepository : RepositoryBase<EmailVerification>, IEmailVerificationRepository
{
    public EmailVerificationRepository(PptDbContext context) : base(context)
    {
    }

    public async Task<EmailVerification?> GetLatestByEmailAsync(string email)
    {
        return await _dbSet
            .Where(x => x.Email == email)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
    }
}