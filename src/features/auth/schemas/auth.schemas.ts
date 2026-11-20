import { z } from 'zod'

import { normalizePhone } from 'src/features/auth/utils/phone'

const nameSchema = z
  .string()
  .trim()
  .min(1, 'errors.required')
  .max(100, 'errors.nameLength')

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('errors.emailInvalid')

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\d{10}$/, 'errors.phoneInvalid'))

const passwordSchema = z
  .string()
  .min(8, 'errors.passwordLength')
  .max(120, 'errors.passwordLength')
  .regex(/[A-Z]/, 'errors.passwordUppercase')
  .regex(/[a-z]/, 'errors.passwordLowercase')
  .regex(/\d/, 'errors.passwordDigit')
  .regex(/[^A-Za-z0-9]/, 'errors.passwordSpecial')

const otpSchema = z.string().regex(/^\d{6}$/, 'errors.otpInvalid')

export const registerSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.confirmMismatch',
  })

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'errors.required'),
  password: z.string().min(1, 'errors.required'),
})

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: otpSchema,
})

export const emailSchemaOnly = z.object({ email: emailSchema })

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.confirmMismatch',
  })

export function makeChangePasswordSchema(requireCurrent: boolean) {
  return z
    .object({
      currentPassword: z.string().optional(),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .superRefine((values, context) => {
      if (requireCurrent && !values.currentPassword) {
        context.addIssue({
          code: 'custom',
          path: ['currentPassword'],
          message: 'errors.required',
        })
      }
      if (values.newPassword === values.currentPassword) {
        context.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: 'errors.newPasswordSame',
        })
      }
      if (values.newPassword !== values.confirmPassword) {
        context.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'errors.confirmMismatch',
        })
      }
    })
}

export function passwordChecks(value: string) {
  return {
    length: value.length >= 8 && value.length <= 120,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    digit: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  }
}

export type RegisterValues = z.input<typeof registerSchema>
export type LoginValues = z.input<typeof loginSchema>
export type VerifyEmailValues = z.input<typeof verifyEmailSchema>
export type EmailValues = z.input<typeof emailSchemaOnly>
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>
