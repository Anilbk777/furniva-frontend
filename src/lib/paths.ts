export const paths = {
  root: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  changePassword: '/change-password',
  organizationSetup: '/create-organization',
  dashboard: '/dashboard',
  employees: '/employees',
  parties: '/parties',
  transactions: '/transactions',
  organization: '/organization',
} as const

export function loginWithNext(next: string): string {
  return `${paths.login}?next=${encodeURIComponent(next)}`
}

export function employeeDetail(id: string): string {
  return `${paths.employees}/${id}`
}

export function partyDetail(id: string): string {
  return `${paths.parties}/${id}`
}

export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}
