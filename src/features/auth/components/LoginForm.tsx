import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'
import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { PasswordInput } from 'src/features/auth/components/PasswordInput'
import { useLogin } from 'src/features/auth/hooks/useLogin'
import { loginSchema, type LoginValues } from 'src/features/auth/schemas/auth.schemas'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { normalizeIdentifier } from 'src/features/auth/utils/phone'
import { paths } from 'src/lib/paths'
import { translate } from 'src/lib/i18n'

export interface LoginFormProps {
  initialIdentifier?: string
}

export function LoginForm({ initialIdentifier = '' }: LoginFormProps) {
  const { t } = useTranslation(['auth', 'errors', 'common'])
  const login = useLogin()
  const [alert, setAlert] = useState<string | undefined>()
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: initialIdentifier, password: '' },
  })

  function handleError(error: unknown, identifier: string): void {
    const mapped = mapApiError(error)
    setAlert(translate(t, mapped.messageKey))
    setUnverifiedEmail(
      mapped.code === 'EMAIL_NOT_VERIFIED' && identifier.includes('@')
        ? identifier.trim().toLowerCase()
        : undefined,
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('auth:loginTitle')}
        subtitle={t('auth:loginSubtitle')}
      />

      {alert ? <Alert variant="error">{alert}</Alert> : null}
      {unverifiedEmail ? (
        <Link
          to={`${paths.verifyEmail}?email=${encodeURIComponent(unverifiedEmail)}`}
          className="font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('auth:verifyEmailLink')}
        </Link>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setAlert(undefined)
          setUnverifiedEmail(undefined)
          login.mutate(
            { identifier: normalizeIdentifier(values.identifier), password: values.password },
            { onError: (error: unknown) => handleError(error, values.identifier) },
          )
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          id="identifier"
          label={t('auth:emailOrPhone')}
          error={errors.identifier?.message ? translate(t, errors.identifier.message) : undefined}
        >
          {(describedBy) => (
            <Input
              id="identifier"
              autoComplete="username"
              aria-invalid={errors.identifier ? true : undefined}
              aria-describedby={describedBy}
              {...register('identifier')}
            />
          )}
        </FormField>

        <FormField
          id="password"
          label={t('auth:password')}
          error={errors.password?.message ? translate(t, errors.password.message) : undefined}
        >
          {(describedBy) => (
            <PasswordInput
              id="password"
              error={errors.password?.message}
              showLabel={t('auth:showPassword')}
              hideLabel={t('auth:hidePassword')}
              inputProps={{ ...register('password'), 'aria-describedby': describedBy }}
            />
          )}
        </FormField>

        <Link
          to={paths.forgotPassword}
          className="self-start font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('auth:forgotPassword')}
        </Link>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {t('auth:login')}
        </Button>
      </form>

      <p className="text-center font-ui text-sm text-charcoal-500">
        <Link to={paths.register} className="font-semibold text-primary underline underline-offset-4">
          {t('auth:createAccount')}
        </Link>
      </p>
    </div>
  )
}
