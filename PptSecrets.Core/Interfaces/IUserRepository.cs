using PptSecrets.Core.Entities;

namespace PptSecrets.Core.Interfaces;

public interface IUserRepository : IRepositoryBase<User>
{
    Task<User?> GetByEmailAsync(string email);
}