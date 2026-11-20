export interface RegisterInput {
  name: string
  phone: string
  email: string
  password: string
}

export interface LoginInput {
  identifier: string
  password: string
}

export interface VerifyEmailInput {
  email: string
  code: string
}

export interface EmailInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  new_password: string
}

export interface ChangePasswordInput {
  current_password?: string
  new_password: string
}

export type { AuthData, MeUser, User } from 'src/types/api'
