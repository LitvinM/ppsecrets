using PptSecrets.Core.Entities;

namespace PptSecrets.Core.Interfaces;

public interface IPaymentTransactionRepository : IRepositoryBase<PaymentTransaction>
{
    Task<PaymentTransaction?> GetByPaymentIdAsync(string paymentId);
}