using Microsoft.AspNetCore.Mvc;
using PptSecrets.Core.Models;
using PptSecrets.Core.Services;

namespace PptSecrets.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, [FromQuery] Language lang)
    {
        await _userService.RegisterAsync(request.Email, lang);
        return Ok(new { message = "Verification code sent to email" });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var user = await _userService.VerifyEmailAsync(request.Email, request.Password, request.Code);

        return Ok(new
        {
            message = "Email verified, Logged in",
            userId = user.Id,
            email = user.Email
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _userService.AuthenticateAsync(request.Email, request.Password);
        if (token == null)
            return Unauthorized("Invalid email or password");

        return Ok(new { token });
    }
}

public class RegisterRequest
{
    public string Email { get; set; } = default!;
}

public class VerifyEmailRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string Code { get; set; } = default!;
}

public class LoginRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
}