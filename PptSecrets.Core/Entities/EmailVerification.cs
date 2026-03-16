namespace PptSecrets.Core.Entities;

public class EmailVerification
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Code { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}