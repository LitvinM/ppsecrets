using Microsoft.EntityFrameworkCore;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;

namespace PptSecrets.DataAccess.Repository;

public class UserPptsRepository : RepositoryBase<UserPpts>, IUserPptsRepository
{
    public UserPptsRepository(PptDbContext context) : base(context)
    {
    }

    public async Task<bool> findByUserPptId(Guid userId, Guid pptId)
    {
        return (await _context.UserPpts.FirstOrDefaultAsync(up => up.User == userId && up.Ppt == pptId)) != null;
    }
}