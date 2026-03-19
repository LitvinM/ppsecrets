using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PptSecrets.Core.Services;
using System.Security.Claims;
using PptSecrets.Core.Entities;
using PptSecrets.Core.Interfaces;

namespace PptSecrets.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PptController : ControllerBase
{
    private readonly IPptService _pptService;
    private readonly IUserService _userService;

    public PptController(IPptService pptService, IUserService userService)
    {
        _pptService = pptService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var ppts = await _pptService.GetAllAsync();
        return Ok(ppts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var ppt = await _pptService.GetByIdAsync(id);
        if (ppt == null) return NotFound();
        return Ok(ppt);
    }

    [HttpPost("buy")]
    [Authorize]
    public async Task<IActionResult> Buy([FromQuery]Guid[] ids)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);

        var list = ids.ToList();
        
        await _pptService.ProcessMultiplePurchasesAsync(list, userEmail!); 
    
        return Ok(new { message = "Purchase processed" });
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download(Guid id)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);

        if (userEmail == null) return Unauthorized();
        if (!(await _userService.findPermission(userEmail, id))) return Forbid();
    
        try 
        {
            var (stream, contentType, fileName) = await _pptService.GetPptFileAsync(id);
        
            // Метод File с тремя параметрами заставляет браузер 
            // интерпретировать ответ как загрузку файла (Content-Disposition: attachment)
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] string name,
        [FromForm] string descRu, [FromForm] string sDescRu, [FromForm] string descEn, [FromForm] string sDescEn, [FromForm] float price,
        [FromForm] IFormFile file, [FromForm] List<IFormFile>? images)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");

        await using var stream = file.OpenReadStream();
        
        var imageStreams = new List<(string FileName, Stream Stream)>();
        if (images != null)
        {
            foreach (var img in images)
            {
                if (img.Length > 0)
                {
                    imageStreams.Add((img.FileName, img.OpenReadStream()));
                }
            }
        }

        try 
        {
            var ppt = await _pptService.CreateAsync(name, file.FileName, descRu, sDescRu, descEn, sDescEn, price, stream, imageStreams);
            return Ok(ppt);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        finally
        {
            foreach (var imgStream in imageStreams)
            {
                await imgStream.Stream.DisposeAsync();
            }
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromForm] string name,
        [FromForm] string descRu, [FromForm] string sDescRu, [FromForm] string descEn, [FromForm] string sDescEn, [FromForm] float price, IFormFile? file, List<IFormFile>? images)
    {
        Stream? stream = null;
        if (file != null) stream = file.OpenReadStream();
        
        var imageStreams = new List<(string FileName, Stream Stream)>();
        if (images != null)
        {
            foreach (var img in images)
            {
                if (img.Length > 0)
                {
                    imageStreams.Add((img.FileName, img.OpenReadStream()));
                }
            }
        }
        
        try
        {
            var ppt = await _pptService.UpdateAsync(id, name, file?.FileName,  descRu, sDescRu, descEn, sDescEn, stream, imageStreams, price);
            if (ppt == null) return NotFound();
            return Ok(ppt);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        finally
        {
            if (stream != null) await stream.DisposeAsync();
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _pptService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
    
    [HttpGet("list-by-ids")]
    public async Task<IActionResult> GetPptsByIds([FromQuery] Guid[] ids)
    {
        var ppts = new List<Ppt>();
        foreach (var id in ids)
        {
            var ppt = await _pptService.GetByIdAsync(id);
            if (ppt != null) ppts.Add(ppt);
        }
        return Ok(ppts);
    }
}