using Microsoft.EntityFrameworkCore;

namespace PptSecrets.Core.Entities;

[PrimaryKey("Id")]
public class UserPpts
{
    public Guid Id { get; set; }
    public Guid User { get; set; }
    public Guid Ppt { get; set; }
}