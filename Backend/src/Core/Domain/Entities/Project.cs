using BirMuhendisinGunlugu.Domain.Common;

namespace BirMuhendisinGunlugu.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
