using PptSecrets.Core.Entities;

namespace PptSecrets.Core.Services;

public interface IPptService
{
    Task<IEnumerable<Ppt>> GetAllAsync();
    Task<Ppt?> GetByIdAsync(Guid id);
    Task<Ppt> CreateAsync(string name, string fileName, string descRu, string sDescRu, string descEn, string sDescEn, float price, Stream fileStream, IEnumerable<(string FileName, Stream Stream)> images);
    Task<Ppt?> UpdateAsync(Guid id, string name, string? fileName, string? descRu, string? sDescRu, string? descEn, string? sDescEn, Stream? fileStream, List<(string FileName, Stream Stream)> imageStreams, float price = 0F);
    Task<bool> DeleteAsync(Guid id);
    Task ProcessMultiplePurchasesAsync(List<Guid> pptIds, string userEmail);
    Task<(Stream stream, string contentType, string fileName)> GetPptFileAsync(Guid id);
}