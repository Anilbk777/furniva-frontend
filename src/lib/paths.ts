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
  attendance: '/attendance',
  parties: '/parties',
  customers: '/customers',
  orders: '/orders',
  organization: '/organization',
} as const

export function loginWithNext(next: string): string {
  return `${paths.login}?next=${encodeURIComponent(next)}`
}

export function employeeDetail(id: string): string {
  return `${paths.employees}/${id}`
}

export function attendanceDetail(employeeId: string): string {
  return `${paths.attendance}/${employeeId}`
}

export function partyDetail(id: string): string {
  return `${paths.parties}/${id}`
}

export function customerDetail(id: string): string {
  return `${paths.customers}/${id}`
}

export function orderDetail(id: string): string {
  return `${paths.orders}/${id}`
}

export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}
