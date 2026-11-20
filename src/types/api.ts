export interface ApiResponse<T> {
  success: boolean
  status_code: number
  message: string
  data: T | null
}

export interface User {
  id: string
  name: string
  phone: string
  email: string
  role: string
  is_active: boolean
  must_change_password: boolean
  email_verified_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Organization {
  id: string
  name: string
  is_active: boolean
}

export interface MeUser extends User {
  organization: Organization | null
}

export interface AuthData {
  user: User
  tokens: null
}

export type ApiErrorCode =
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_SUSPENDED'
  | 'PASSWORD_CHANGE_REQUIRED'

export interface ErrorPayload {
  code?: ApiErrorCode
}

export interface FieldError {
  field: string
  message: string
}
