export { LoginPage } from 'src/features/auth/pages/LoginPage'
export { RegisterPage } from 'src/features/auth/pages/RegisterPage'
export { VerifyEmailPage } from 'src/features/auth/pages/VerifyEmailPage'
export { ForgotPasswordPage } from 'src/features/auth/pages/ForgotPasswordPage'
export { ResetPasswordPage } from 'src/features/auth/pages/ResetPasswordPage'
export { ChangePasswordPage } from 'src/features/auth/pages/ChangePasswordPage'

export { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'

export { GuestOnly } from 'src/features/auth/guards/GuestOnly'
export { RequireAuth } from 'src/features/auth/guards/RequireAuth'
export { RequirePasswordSet } from 'src/features/auth/guards/RequirePasswordSet'

export { useMe } from 'src/features/auth/hooks/useMe'
export { useLogin } from 'src/features/auth/hooks/useLogin'
export { useRegister } from 'src/features/auth/hooks/useRegister'
export { useVerifyEmail } from 'src/features/auth/hooks/useVerifyEmail'
export { useResendCode } from 'src/features/auth/hooks/useResendCode'
export { useLogout } from 'src/features/auth/hooks/useLogout'
export { useLogoutAll } from 'src/features/auth/hooks/useLogoutAll'
export { useForgotPassword } from 'src/features/auth/hooks/useForgotPassword'
export { useResetPassword } from 'src/features/auth/hooks/useResetPassword'
export { useChangePassword } from 'src/features/auth/hooks/useChangePassword'
export { useCountdown } from 'src/features/auth/hooks/useCountdown'
export { clearLocalSession } from 'src/features/auth/hooks/useLogout'

export { mapApiError, applyFieldErrors } from 'src/features/auth/utils/errorMap'
export { normalizePhone, normalizeIdentifier } from 'src/features/auth/utils/phone'
export { authKeys } from 'src/features/auth/api/keys'
export {
  passwordChecks,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  emailSchemaOnly,
  resetPasswordSchema,
  makeChangePasswordSchema,
} from 'src/features/auth/schemas/auth.schemas'

export type { MappedError, SetFieldError } from 'src/features/auth/utils/errorMap'
export type { AuthData, MeUser, User } from 'src/features/auth/types'
