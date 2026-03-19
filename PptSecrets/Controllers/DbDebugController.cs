using Microsoft.AspNetCore.Mvc;
using PptSecrets.Core.Interfaces;
using PptSecrets.Core.Services;

namespace PptSecrets.Controllers;


[ApiController]
[Route("api/debug")]
public class DbDebugController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public DbDebugController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _uow.Users.GetAllAsync());
    }
    [HttpGet("ppts")]
    public async Task<IActionResult> GetPpts()
    {
        return Ok(await _uow.Users.GetAllAsync());
    }
    [HttpGet("up")]
    public async Task<IActionResult> GetUserPpts()
    {
        return Ok(await _uow.Users.GetAllAsync());
    }
    [HttpGet("email")]
    public async Task<IActionResult> GetEmailVerifications()
    {
        return Ok(await _uow.Users.GetAllAsync());
    }
    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments()
    {
        return Ok(await _uow.Users.GetAllAsync());
    }
}