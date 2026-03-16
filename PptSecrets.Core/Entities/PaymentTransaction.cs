namespace PptSecrets.Core.Entities;

public class PaymentTransaction
{
    public Guid Id { get; set; }
    public string YooKassaPaymentId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string PptIds { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public float Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}