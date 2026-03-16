using PptSecrets.Core.Entities;

namespace PptSecrets.Core.Interfaces;

public interface IUserPptsRepository : IRepositoryBase<UserPpts>
{
    Task<bool> findByUserPptId(Guid userId, Guid pptId);
}