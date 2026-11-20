import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  makeChangePasswordSchema,
  passwordChecks,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from 'src/features/auth/schemas/auth.schemas'

describe('auth schemas', () => {
  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({
      name: 'Demo User',
      phone: '+977 9841234567',
      email: ' User@Example.COM ',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid phone numbers', () => {
    const result = registerSchema.safeParse({
      name: 'Demo User',
      phone: '12345',
      email: 'user@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'Password1!',
      confirmPassword: 'Password2!',
    })
    expect(result.success).toBe(false)
  })

  it('tracks every password rule', () => {
    expect(passwordChecks('Password1!')).toEqual({
      length: true,
      uppercase: true,
      lowercase: true,
      digit: true,
      special: true,
    })
  })

  it('requires a six-digit verification code', () => {
    expect(
      verifyEmailSchema.safeParse({ email: 'user@example.com', code: '123456' }).success,
    ).toBe(true)
    expect(
      verifyEmailSchema.safeParse({ email: 'user@example.com', code: '12a456' }).success,
    ).toBe(false)
  })

  it('requires an identifier and password when logging in', () => {
    expect(loginSchema.safeParse({ identifier: '', password: '' }).success).toBe(false)
  })

  it('requires the current password for a normal change', () => {
    expect(
      makeChangePasswordSchema(true).safeParse({
        newPassword: 'Password1!',
        confirmPassword: 'Password1!',
      }).success,
    ).toBe(false)
  })

  it('does not require the current password for a forced change', () => {
    expect(
      makeChangePasswordSchema(false).safeParse({
        newPassword: 'Password1!',
        confirmPassword: 'Password1!',
      }).success,
    ).toBe(true)
  })
})
