using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace PptSecrets.Core.Services;

public class YooKassaService : IYooKassaService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public YooKassaService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<string> CreatePaymentAsync(float amount, string description, string returnUrl, Guid transactionId)
    {
        var shopId = _config["YooKassa:ShopId"];
        var secretKey = _config["YooKassa:SecretKey"];

        var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{shopId}:{secretKey}"));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);
        _httpClient.DefaultRequestHeaders.Add("Idempotence-Key", Guid.NewGuid().ToString());

        var payload = new
        {
            amount = new { value = amount.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture), currency = "RUB" },
            capture = true,
            confirmation = new { type = "redirect", return_url = returnUrl },
            description = description,
            metadata = new { transaction_id = transactionId.ToString() }
        };

        var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("https://api.yookassa.ru/v3/payments", content);
        var responseString = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"YooKassa Error: {responseString}");

        dynamic result = JsonConvert.DeserializeObject(responseString)!;
        return result.confirmation.confirmation_url;
    }
}