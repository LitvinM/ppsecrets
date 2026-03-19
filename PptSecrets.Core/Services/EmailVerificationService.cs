using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;
using PptSecrets.Core.Models;

namespace PptSecrets.Core.Services;

public class EmailVerificationService : IEmailVerificationService
{
    private readonly IConfiguration _config;
    private readonly IUnitOfWork _uow;

    public EmailVerificationService(IConfiguration config, IUnitOfWork uow)
    {
        _config = config;
        _uow = uow;
    }

    public async Task SendVerificationCodeAsync(string email, Language lang)
    {
        var code = GenerateRandomCode(6);

        var existing = await _uow.EmailVerifications.GetAllAsync(); 
        var oldCodes = existing.Where(x => x.Email == email);
        foreach(var old in oldCodes) _uow.EmailVerifications.Remove(old);

        await _uow.EmailVerifications.AddAsync(new EmailVerification
        {
            Email = email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });
        await _uow.SaveChangesAsync();

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("PptSecrets Support", _config["Email:SmtpUser"]));
        message.To.Add(new MailboxAddress("", email));

        if (lang == Language.Ru)
        {
            message.Subject = "Ваш код подтверждения";
            message.Body = new TextPart(TextFormat.Html) { Text = GetHtmlTemplate("Используйте этот код для верификации:", code, "Код действителен 10 минут.") };
        }
        else
        {
            message.Subject = "Your Verification Code";
            message.Body = new TextPart(TextFormat.Html) { Text = GetHtmlTemplate("Use this code for verification:", code, "Code is valid for 10 minutes.") };
        }

        using var client = new SmtpClient();
        client.ServerCertificateValidationCallback = (s, c, h, e) => true;
        await client.ConnectAsync(_config["Email:SmtpHost"], int.Parse(_config["Email:SmtpPort"]!), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["Email:SmtpUser"], _config["Email:SmtpPass"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private string GetHtmlTemplate(string title, string code, string footer) => 
        $@"<div style='font-family: sans-serif; padding: 20px;'>
        <h2>PptSecrets</h2>
        <p>{title}</p>
        <div style='font-size: 24px; font-weight: bold; background: #f1f5f9; padding: 10px; display: inline-block;'>{code}</div>
        <p style='color: gray;'>{footer}</p>
    </div>";

    public async Task<bool> VerifyCodeAsync(string email, string code)
    {
        var record = await _uow.EmailVerifications.GetLatestByEmailAsync(email);

        if (record == null || record.Code != code || record.ExpiresAt < DateTime.UtcNow)
        {
            return false;
        }

        _uow.EmailVerifications.Remove(record);
        await _uow.SaveChangesAsync();

        return true;
    }
    

    private string GenerateRandomCode(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}