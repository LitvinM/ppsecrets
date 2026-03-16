namespace PptSecrets.Core.Services;

public interface IYooKassaService
{
    Task<string> CreatePaymentAsync(float amount, string description, string returnUrl, Guid transactionId);
}