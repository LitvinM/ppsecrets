namespace PptSecrets.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IPptRepository Ppts { get; }
    IUserPptsRepository UserPpts { get; }
    IEmailVerificationRepository EmailVerifications { get; }
    IPaymentTransactionRepository PaymentTransactions { get; }
    Task<int> SaveChangesAsync();
}