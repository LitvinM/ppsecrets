using Microsoft.EntityFrameworkCore;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;

namespace PptSecrets.DataAccess.Repository;

public class PaymentTransactionRepository : RepositoryBase<PaymentTransaction>, IPaymentTransactionRepository
{
    public PaymentTransactionRepository(PptDbContext context) : base(context) { }

    public async Task<PaymentTransaction?> GetByPaymentIdAsync(string paymentId)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.YooKassaPaymentId == paymentId);
    }
}