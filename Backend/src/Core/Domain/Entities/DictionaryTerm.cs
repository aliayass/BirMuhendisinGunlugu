using BirMuhendisinGunlugu.Domain.Common;

namespace BirMuhendisinGunlugu.Domain.Entities;

public class DictionaryTerm : BaseEntity
{
    public string Term { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
