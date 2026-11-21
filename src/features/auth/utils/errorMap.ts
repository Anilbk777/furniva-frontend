import axios from 'axios'

import type { ApiErrorCode, FieldError } from 'src/types/api'

export interface MappedError {
  status: number
  code?: ApiErrorCode
  messageKey: string
  field?: string
  fields?: FieldError[]
}

const codeKeys: Record<ApiErrorCode, string> = {
  EMAIL_NOT_VERIFIED: 'errors.emailNotVerified',
  ACCOUNT_SUSPENDED: 'errors.accountSuspended',
  PASSWORD_CHANGE_REQUIRED: 'errors.passwordChangeRequired',
}

const messageKeys: Record<string, string> = {
  'Invalid credentials': 'errors.invalidCredentials',
  'Invalid or expired code': 'errors.invalidCode',
  'A user with this email already exists': 'errors.emailTaken',
  'A user with this phone number already exists': 'errors.phoneTaken',
  'A user with this phone number or email already exists': 'errors.accountExists',
  'Please wait a minute before trying again': 'errors.tooSoon',
  'Too many requests. Try again in an hour': 'errors.tooMany',
  'This reset link is invalid or has expired': 'errors.resetLinkInvalid',
  'Current password is incorrect': 'errors.currentPasswordWrong',
  'Your account has been suspended': 'errors.accountSuspended',
  'Please verify your email before logging in': 'errors.emailNotVerified',
  'Please set your password to continue': 'errors.passwordChangeRequired',
  'New password must be different from the current one': 'errors.newPasswordSame',
  'You already have an organization': 'errors.organizationExists',
  'Organization not found': 'errors.organizationNotFound',
  'Employee not found': 'errors.employeeNotFound',
  'Transaction not found': 'errors.transactionNotFound',
  'date from cannot be after date to': 'errors.dateRangeInvalid',
  'employee_advance needs a payment_method': 'errors.paymentMethodRequired',
  'employee_salary needs a payment_method': 'errors.paymentMethodRequired',
  'unknown transaction kind': 'errors.transactionKindInvalid',
  'Name is required': 'errors.organizationNameRequired',
  'Name should have at least 1 character': 'errors.organizationNameRequired',
  'Name should have at most 120 characters': 'errors.organizationNameLength',
  'Name should be a valid string': 'errors.organizationNameRequired',
  'Party not found': 'errors.partyNotFound',
  'Party type not found': 'errors.partyTypeNotFound',
  'This party type already exists': 'errors.partyTypeExists',
  'Parties still use this type. Move or remove them first': 'errors.partyTypeInUse',
  'Phone number must contain only digits': 'errors.phoneInvalid',
  'From date must not be after to date': 'errors.attendanceRangeInvalid',
  "Date range can't be longer than 366 days": 'errors.attendanceRangeTooLong',
  'Attendance record not found': 'errors.attendanceNotFound',
  'Attendance for this employee on this date already exists': 'errors.attendanceExists',
  "Absent and leave days can't have check-in, check-out or overtime":
    'errors.attendanceNoWorkFields',
  'Check-out needs a check-in time': 'errors.attendanceCheckoutNeedsCheckin',
  'Check-out must be after check-in': 'errors.attendanceCheckoutBeforeCheckin',
  'BS date must look like 2081-04-15 (YYYY-MM-DD)': 'errors.attendanceBsDateFormat',
  'This is not a valid BS date': 'errors.attendanceBsDateInvalid',
  'Time must be in 12-hour format like 09:30 AM': 'errors.attendanceTimeInvalid',
}

function messageKeyFor(message: string): string | undefined {
  if (messageKeys[message]) return messageKeys[message]
  if (message.startsWith('Attendance for ') && message.endsWith(' already exists')) {
    return 'errors.attendanceExists'
  }
  if (message.startsWith('Status must be one of')) {
    return 'errors.attendanceStatusInvalid'
  }
  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return (
    value === 'EMAIL_NOT_VERIFIED' ||
    value === 'ACCOUNT_SUSPENDED' ||
    value === 'PASSWORD_CHANGE_REQUIRED'
  )
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string'
}

export function mapApiError(error: unknown): MappedError {
  if (!axios.isAxiosError(error)) {
    return { status: 0, messageKey: 'errors.network' }
  }

  const status = error.response?.status ?? 0
  const payload = error.response?.data as { message?: string; data?: unknown } | undefined
  const data = payload?.data

  let code: ApiErrorCode | undefined
  let field: string | undefined
  let fields: FieldError[] | undefined

  if (Array.isArray(data)) {
    fields = data.filter(isFieldError)
    field = fields[0]?.field
  } else if (isRecord(data)) {
    if (isApiErrorCode(data.code)) code = data.code
    if (typeof data.field === 'string') field = data.field
  }

  const message = payload?.message ?? ''
  const messageKey =
    (code ? codeKeys[code] : undefined) ?? messageKeyFor(message) ?? 'errors.generic'

  return { status, code, messageKey, field, fields }
}

export type SetFieldError = (
  field: string,
  error: { type: string; message: string },
) => void

export function applyFieldErrors(mapped: MappedError, setError: SetFieldError): void {
  if (mapped.fields && mapped.fields.length > 0) {
    for (const item of mapped.fields) {
      setError(item.field, { type: 'server', message: item.message })
    }
    return
  }
  if (mapped.field) {
    setError(mapped.field, { type: 'server', message: mapped.messageKey })
  }
}
