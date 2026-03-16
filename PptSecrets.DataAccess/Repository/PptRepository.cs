using Microsoft.EntityFrameworkCore;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;

namespace PptSecrets.DataAccess.Repository;

public class PptRepository : RepositoryBase<Ppt>, IPptRepository
{
    public PptRepository(PptDbContext context) : base(context)
    {
    }
}