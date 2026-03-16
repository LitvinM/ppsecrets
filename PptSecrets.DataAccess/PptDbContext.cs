using PptSecrets.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace PptSecrets.DataAccess;

public class PptDbContext : DbContext
{
    public PptDbContext(DbContextOptions<PptDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Ppt> Ppts { get; set; }
    public DbSet<UserPpts> UserPpts { get; set; }
    public DbSet<EmailVerification> EmailVerifications { get; set; }
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PptDbContext).Assembly);
    }
}