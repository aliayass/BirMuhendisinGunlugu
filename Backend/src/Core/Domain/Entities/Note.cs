using BirMuhendisinGunlugu.Domain.Common;

namespace BirMuhendisinGunlugu.Domain.Entities;

public class Note : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public string UserId { get; set; } = string.Empty;
}
