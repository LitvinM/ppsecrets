using System.ComponentModel.DataAnnotations.Schema;

namespace PptSecrets.Core.Entities;

public class Ppt
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string DescriptionRu { get; set; } = "";
    public string DescriptionEn { get; set; } = "";
    public string ShortDescriptionRu { get; set; } = "";
    public string ShortDescriptionEn { get; set; } = "";
    public string Path { get; set; } = "";
    public uint Bought { get; set; }
    public float Price { get; set; }

    [NotMapped]
    public List<string> Images { get; set; } = new();
}