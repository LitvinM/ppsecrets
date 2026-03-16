using PptSecrets.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PptSecrets.DataAccess.Repository;

public class RepositoryBase<T> : IRepositoryBase<T> where T : class
{
    protected readonly PptDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public RepositoryBase(PptDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
    public virtual async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
    public virtual async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
    public virtual void Remove(T entity) => _dbSet.Remove(entity);
    public virtual void Update(T entity) => _dbSet.Update(entity);
}