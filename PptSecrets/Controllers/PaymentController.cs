using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;
using PptSecrets.Core.Services;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IYooKassaService _yooKassaService;
    private readonly IUnitOfWork _uow;
    private readonly IPptService _pptService;
    private readonly IConfiguration _config;

    public PaymentController(IYooKassaService yooKassaService, IUnitOfWork uow, IPptService pptService, IConfiguration config)
    {
        _yooKassaService = yooKassaService;
        _uow = uow;
        _pptService = pptService;
        _config = config;
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePayment([FromBody] Guid[] pptIds)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (userEmail == null) return Unauthorized();

        float totalAmount = 0;
        var validPptIds = new List<Guid>();

        foreach (var id in pptIds)
        {
            var ppt = await _uow.Ppts.GetByIdAsync(id);
            if (ppt != null)
            {
                totalAmount += ppt.Price;
                validPptIds.Add(ppt.Id);
            }
        }

        if (totalAmount <= 0) return BadRequest("Сумма заказа должна быть больше нуля.");

        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            UserEmail = userEmail,
            PptIds = string.Join(",", validPptIds),
            Amount = totalAmount,
            Status = "pending"
        };
        await _uow.PaymentTransactions.AddAsync(transaction);
        await _uow.SaveChangesAsync();

        var baseUrl = _config["frontip"] ?? "http://localhost:3000";
        var returnUrl = $"{baseUrl}/success?ids={transaction.PptIds}";

        try
        {
            var confirmationUrl = await _yooKassaService.CreatePaymentAsync(totalAmount, "Оплата презентаций", returnUrl, transaction.Id);
            return Ok(new { confirmationUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var json = JObject.Parse(body);

        var eventType = json["event"]?.ToString();
        if (eventType == "payment.succeeded")
        {
            var paymentObj = json["object"];
            var transactionIdStr = paymentObj?["metadata"]?["transaction_id"]?.ToString();
            
            if (Guid.TryParse(transactionIdStr, out Guid transactionId))
            {
                var transaction = await _uow.PaymentTransactions.GetByIdAsync(transactionId);
                if (transaction != null && transaction.Status == "pending")
                {
                    transaction.Status = "succeeded";
                    transaction.YooKassaPaymentId = paymentObj["id"]?.ToString() ?? "";
                    _uow.PaymentTransactions.Update(transaction);
                    await _uow.SaveChangesAsync();

                    var pptIds = transaction.PptIds.Split(',').Select(Guid.Parse).ToList();
                    await _pptService.ProcessMultiplePurchasesAsync(pptIds, transaction.UserEmail);
                }
            }
        }
        return Ok();
    }
}