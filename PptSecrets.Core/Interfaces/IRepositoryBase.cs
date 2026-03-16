namespace PptSecrets.Core.Interfaces;

public interface IRepositoryBase<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(Guid id);
    Task AddAsync(T entity);
    void Remove(T entity);
    void Update(T entity);
}