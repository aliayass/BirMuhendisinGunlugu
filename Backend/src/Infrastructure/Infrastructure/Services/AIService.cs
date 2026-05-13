using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using BirMuhendisinGunlugu.Application.Interfaces.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BirMuhendisinGunlugu.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<AIService> _logger;

    public AIService(HttpClient httpClient, IConfiguration configuration, ILogger<AIService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["AI:OpenAI:ApiKey"] ?? "";
        _model = configuration["AI:OpenAI:Model"] ?? "gpt-3.5-turbo";
        _logger = logger;
    }

    public async Task<string> SummarizeNoteAsync(string content, CancellationToken ct = default)
    {
        return await CallOpenAIAsync("Aşağıdaki teknik notu bir mühendis için özetle ve önemli noktaları maddeler halinde çıkar:\n\n" + content, ct);
    }

    public async Task<string> ExplainCodeAsync(string code, string language, CancellationToken ct = default)
    {
        return await CallOpenAIAsync($"Aşağıdaki {language} kodunu detaylıca açıkla, ne işe yaradığını ve mantığını anlat:\n\n{code}", ct);
    }

    public async Task<string> SuggestTagsAsync(string content, CancellationToken ct = default)
    {
        return await CallOpenAIAsync("Aşağıdaki içerik için en uygun 5 teknik etiketi (virgülle ayrılmış şekilde) öner:\n\n" + content, ct);
    }

    private async Task<string> CallOpenAIAsync(string prompt, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            return "AI API anahtarı yapılandırılmamış. Lütfen appsettings.json dosyasını kontrol edin.";
        }

        try
        {
            var requestBody = new
            {
                model = _model,
                messages = new[]
                {
                    new { role = "system", content = "Sen profesyonel bir mühendis asistanısın." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
            request.Content = JsonContent.Create(requestBody);

            var response = await _httpClient.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
            var result = jsonResponse.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            return result ?? "AI cevap üretemedi.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI API hatası");
            return $"AI servisiyle iletişim kurulurken bir hata oluştu: {ex.Message}";
        }
    }
}
