using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;

namespace PptSecrets.Core.Services;

public class PptService : IPptService
{
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;
    private readonly string _pptFolderPath;
    private readonly string _imagesFolderPath;
    private readonly string[] _allowedPptExtensions = { ".ppt", ".pptx", ".pptm", ".ppsx" };
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png" };

    public PptService(IUnitOfWork uow, IConfiguration config)
    {
        _uow = uow;
        _config = config;
        var currentDir = Directory.GetCurrentDirectory();
        
        _pptFolderPath = Path.Combine(currentDir, "presentations");
        _imagesFolderPath = Path.Combine(currentDir, "images");
        
        if (!Directory.Exists(_pptFolderPath)) Directory.CreateDirectory(_pptFolderPath);
        if (!Directory.Exists(_imagesFolderPath)) Directory.CreateDirectory(_imagesFolderPath);
    }

    public async Task<IEnumerable<Ppt>> GetAllAsync()
    {
        var ppts = (await _uow.Ppts.GetAllAsync()).ToList();
        foreach (var ppt in ppts)
        {
            LoadImages(ppt);
        }
        return ppts;
    }

    public async Task<Ppt?> GetByIdAsync(Guid id)
    {
        var ppt = await _uow.Ppts.GetByIdAsync(id);
        if (ppt != null)
        {
            LoadImages(ppt);
        }
        return ppt;
    }

    public async Task<Ppt> CreateAsync(string name, string fileName, string descRu, string sDescRu, string descEn, string sDescEn, float price, Stream fileStream, IEnumerable<(string FileName, Stream Stream)> images)
    {
        var savedPath = await SaveFileLocallyAsync(fileName, fileStream, _pptFolderPath, _allowedPptExtensions, "presentations");
        var ppt = new Ppt { Name = name, Path = savedPath, DescriptionRu = descRu, ShortDescriptionRu = sDescRu, DescriptionEn = descEn, ShortDescriptionEn = sDescEn, Price = price, Bought = 0 };
        
        await SaveImagesAsync(name, images);

        await _uow.Ppts.AddAsync(ppt);
        await _uow.SaveChangesAsync();
        
        LoadImages(ppt);
        return ppt;
    }

    public async Task<Ppt?> UpdateAsync(Guid id, string name, string? fileName, string? descRu, string? sDescRu, string? descEn, string? sDescEn, Stream? fileStream, List<(string FileName, Stream Stream)> imageStreams, float price = 0)
    {
        var ppt = await _uow.Ppts.GetByIdAsync(id);
        if (ppt == null) return null;

        if (ppt.Name != name)
        {
            var oldImgDir = Path.Combine(_imagesFolderPath, ppt.Name);
            var newImgDir = Path.Combine(_imagesFolderPath, name);
            if (Directory.Exists(oldImgDir) && !Directory.Exists(newImgDir))
            {
                Directory.Move(oldImgDir, newImgDir);
            }
            ppt.Name = name;
        }

        if (descRu != null)
        {
            ppt.DescriptionRu = descRu;
        }
        
        if (sDescRu != null)
        {
            ppt.ShortDescriptionRu = sDescRu;
        }
        
        if (descEn != null)
        {
            ppt.DescriptionEn = descEn;
        }
        
        if (sDescEn != null)
        {
            ppt.ShortDescriptionEn = sDescEn;
        }
        
        if (price != 0)
        {
            ppt.Price = price;
        }

        if (fileStream != null && !string.IsNullOrEmpty(fileName))
        {
            DeleteLocalFile(ppt.Path, _pptFolderPath);
            ppt.Path = await SaveFileLocallyAsync(fileName, fileStream, _pptFolderPath, _allowedPptExtensions, "presentations");
        }
        
        LoadImages(ppt);

        foreach (var image in ppt.Images)
        {
            var imgDir = Path.Combine(_imagesFolderPath, ppt.Name);
            DeleteLocalFile(image, imgDir);
        }

        ppt.Images = new List<string>();
        
        await SaveImagesAsync(name, imageStreams);

        _uow.Ppts.Update(ppt);
        await _uow.SaveChangesAsync();
        
        LoadImages(ppt);
        return ppt;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var ppt = await _uow.Ppts.GetByIdAsync(id);
        if (ppt == null) return false;

        DeleteLocalFile(ppt.Path, _pptFolderPath);
        
        var imgDir = Path.Combine(_imagesFolderPath, ppt.Name);
        if (Directory.Exists(imgDir))
        {
            Directory.Delete(imgDir, true);
        }

        _uow.Ppts.Remove(ppt);
        await _uow.SaveChangesAsync();
        return true;
    }
    
    private async Task SaveImagesAsync(string pptName, IEnumerable<(string FileName, Stream Stream)> images)
    {
        if (images == null || !images.Any()) return;

        var targetDir = Path.Combine(_imagesFolderPath, pptName);
        if (!Directory.Exists(targetDir)) Directory.CreateDirectory(targetDir);

        foreach (var img in images)
        {
            await SaveFileLocallyAsync(img.FileName, img.Stream, targetDir, _allowedImageExtensions, $"images/{pptName}");
        }
    }

    private async Task<string> SaveFileLocallyAsync(string fileName, Stream stream, string targetFolderPath, string[] allowedExtensions, string relativeFolder)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        if (!allowedExtensions.Contains(ext)) 
            throw new Exception($"Extension {ext} not allowed.");

        var newName = $"{Path.GetFileNameWithoutExtension(fileName)}_{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(targetFolderPath, newName);

        using var fs = new FileStream(fullPath, FileMode.Create);
        await stream.CopyToAsync(fs);

        return $"./{relativeFolder}/{newName}";
    }

    private void DeleteLocalFile(string relativePath, string baseFolder)
    {
        if (string.IsNullOrEmpty(relativePath)) return;
        var fileName = Path.GetFileName(relativePath);
        var fullPath = Path.Combine(baseFolder, fileName);
        if (File.Exists(fullPath)) File.Delete(fullPath);
    }

    private void LoadImages(Ppt ppt)
    {
        var folder = Path.Combine(_imagesFolderPath, ppt.Name);
        if (Directory.Exists(folder))
        {
            var files = Directory.GetFiles(folder);
            ppt.Images = files.Select(f => $"./images/{ppt.Name}/{Path.GetFileName(f)}").ToList();
        }
        else
        {
            ppt.Images = new List<string>();
        }
    }

    public async Task ProcessMultiplePurchasesAsync(List<Guid> pptIds, string userEmail)
    {
        var ppts = new List<Ppt>();
        var user = await _uow.Users.GetByEmailAsync(userEmail);
        foreach (var id in pptIds)
        {
            var ppt = await _uow.Ppts.GetByIdAsync(id);
            
            ppt.Bought++;
            
            _uow.Ppts.Update(ppt);

            var userPpts = new UserPpts { User = user!.Id, Ppt = ppt.Id };

            if(!(await _uow.UserPpts.findByUserPptId(userPpts.User, userPpts.Ppt)))
                await _uow.UserPpts.AddAsync(userPpts);
            
            ppts.Add(ppt);
        }

        await SendSingleSuccessEmailAsync(userEmail, ppts);

        await _uow.SaveChangesAsync();
    }

    private async Task SendSingleSuccessEmailAsync(string userEmail, List<Ppt> ppts)
    {
        var smtpHost = _config["Email:SmtpHost"];
        var smtpPort = int.Parse(_config["Email:SmtpPort"]!);
        var smtpUser = _config["Email:SmtpUser"];
        var smtpPass = _config["Email:SmtpPass"];
        var ownerEmail = _config["Email:OwnerEmail"];
        var baseUrl = _config["BaseUrl"];
    
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("PptSecrets", smtpUser));
        message.To.Add(new MailboxAddress("", userEmail));
        message.Subject = "Ваши купленные презентации";

        var ownerPpts = "";
        
        var bodyText = "Спасибо за покупку! Вот ссылки на ваши файлы:\n\n";
        foreach (var ppt in ppts)
        {
            bodyText += $"- {ppt.Name}: {baseUrl}/api/ppt/download/{ppt.Id}\n";
            ownerPpts += $"{ppt.Name}, ";
        }

        message.Body = new TextPart("plain") { Text = bodyText };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(smtpUser, smtpPass);
        
        await client.SendAsync(message);

        
        if (!string.IsNullOrEmpty(ownerEmail))
        {
            var ownerMessage = new MimeMessage();
            ownerMessage.From.Add(new MailboxAddress("PptSecrets System", smtpUser));
            ownerMessage.To.Add(new MailboxAddress("Owner", ownerEmail));
            ownerMessage.Subject = "Новая покупка презентации!";
            ownerMessage.Body = new TextPart("plain")
            {
                Text = $"Пользователь {userEmail} приобрел \"{ownerPpts}\"\n" +
                       $"Файл успешно доставлен."
            };
            await client.SendAsync(ownerMessage);
        }

        await client.DisconnectAsync(true);
    }
    
    public async Task<(Stream stream, string contentType, string fileName)> GetPptFileAsync(Guid id)
    {
        var ppt = await _uow.Ppts.GetByIdAsync(id);
        if (ppt == null) throw new Exception("Презентация не найдена");

        // Формируем полный путь к файлу. 
        // В вашем проекте файлы хранятся в папке "presentations"
        var fileName = Path.GetFileName(ppt.Path);
        var filePath = Path.Combine(_pptFolderPath, fileName);

        if (!File.Exists(filePath)) throw new Exception("Файл не найден на сервере");

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
    
        // Стандартный MIME-тип для презентаций или универсальный
        var contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"; 
    
        return (stream, contentType, ppt.Name + Path.GetExtension(fileName));
    }
}