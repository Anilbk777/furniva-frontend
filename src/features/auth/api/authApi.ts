import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  ChangePasswordInput,
  EmailInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from 'src/features/auth/types'
import type { AuthData, MeUser } from 'src/types/api'

export function register(input: RegisterInput): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/register', input).then((response) => response.data)
}

export function verifyEmail(input: VerifyEmailInput): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/verify-email', input).then((r) => r.data)
}

export function resendVerification(input: EmailInput): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/resend-verification', input).then((r) => r.data)
}

export function login(input: LoginInput): Promise<ApiResponse<AuthData>> {
  return http.post<ApiResponse<AuthData>>('/auth/login', input).then((r) => r.data)
}

export function getMe(): Promise<ApiResponse<MeUser>> {
  return http.get<ApiResponse<MeUser>>('/auth/me').then((r) => r.data)
}

export function refresh(): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/refresh').then((r) => r.data)
}

export function logout(): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/logout').then((r) => r.data)
}

export function logoutAll(): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/logout-all').then((r) => r.data)
}

export function forgotPassword(input: EmailInput): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/forgot-password', input).then((r) => r.data)
}

export function resetPassword(input: ResetPasswordInput): Promise<ApiResponse<null>> {
  return http.post<ApiResponse<null>>('/auth/reset-password', input).then((r) => r.data)
}

export function changePassword(input: ChangePasswordInput): Promise<ApiResponse<AuthData>> {
  return http.post<ApiResponse<AuthData>>('/auth/change-password', input).then((r) => r.data)
}
