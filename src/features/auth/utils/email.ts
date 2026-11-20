export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const first = local.charAt(0)
  return `${first}***@${domain}`
}
