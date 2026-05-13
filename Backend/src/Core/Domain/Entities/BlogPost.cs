using BirMuhendisinGunlugu.Domain.Common;

namespace BirMuhendisinGunlugu.Domain.Entities;

public class BlogPost : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}
