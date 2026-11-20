export function normalizePhone(value: string): string {
  const withoutSeparators = value.trim().replace(/[\s\-()]/g, '')
  const withoutCountryCode = withoutSeparators.replace(/^\+?977/, '')
  const withoutTrunkPrefix = withoutCountryCode.replace(/^01(?=\d{10}$)/, '')
  const withoutLeadingZeros = withoutTrunkPrefix.replace(/^0+/, '')
  return withoutLeadingZeros.replace(/\D/g, '')
}

export function normalizeIdentifier(value: string): string {
  return value.includes('@') ? value.trim().toLowerCase() : normalizePhone(value)
}
