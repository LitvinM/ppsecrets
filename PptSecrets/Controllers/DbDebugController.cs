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

}