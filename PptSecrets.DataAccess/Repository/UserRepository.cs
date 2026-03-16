using PptSecrets.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using PptSecrets.Core.Entities;

namespace PptSecrets.DataAccess.Repository;

public class UserRepository : RepositoryBase<User>, IUserRepository
{
    public UserRepository(PptDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }
}