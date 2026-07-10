using System.ComponentModel.DataAnnotations;

namespace PliqCx.Api.Common.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class NotBlankAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
        => value is string s && !string.IsNullOrWhiteSpace(s);
}
