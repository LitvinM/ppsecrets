using PptSecrets.Core.Interfaces;

namespace PptSecrets.DataAccess.Repository;

public class UnitOfWork : IUnitOfWork
{
    private readonly PptDbContext _context;
    

    public UnitOfWork(PptDbContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Ppts = new PptRepository(_context);
        UserPpts = new UserPptsRepository(_context);
        EmailVerifications = new EmailVerificationRepository(_context);
        PaymentTransactions = new PaymentTransactionRepository(_context);
    }

    public IUserRepository Users { get; }
    public IPptRepository Ppts { get; }
    public IUserPptsRepository UserPpts { get; }
    public IEmailVerificationRepository EmailVerifications { get; }
    public IPaymentTransactionRepository PaymentTransactions { get; }

    public async Task<int> SaveChangesAsync()
        => await _context.SaveChangesAsync();

    public void Dispose()
        => _context.Dispose();
}
