import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'
import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { PasswordChecklist } from 'src/features/auth/components/PasswordChecklist'
import { PasswordInput } from 'src/features/auth/components/PasswordInput'
import { PhoneInput } from 'src/features/auth/components/PhoneInput'
import { useRegister } from 'src/features/auth/hooks/useRegister'
import {
  registerSchema,
  type RegisterValues,
} from 'src/features/auth/schemas/auth.schemas'
import { applyFieldErrors, mapApiError } from 'src/features/auth/utils/errorMap'
import { normalizePhone } from 'src/features/auth/utils/phone'
import { paths } from 'src/lib/paths'
import { storage } from 'src/lib/storage'
import { translate } from 'src/lib/i18n'

export interface RegisterFormProps {
  onSuccess?: (email: string) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useTranslation(['auth', 'errors', 'common'])
  const registerMutation = useRegister()
  const [alert, setAlert] = useState<string | undefined>()
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const password = useWatch({ control, name: 'password' }) ?? ''

  function handleError(error: unknown): void {
    const mapped = mapApiError(error)
    setAlert(translate(t, mapped.messageKey))
    if (mapped.status === 409) {
      const field = mapped.messageKey === 'errors.phoneTaken' ? 'phone' : 'email'
      setError(field, { type: 'server', message: mapped.messageKey })
      return
    }
    applyFieldErrors(mapped, (field, fieldError) => {
      setError(field as keyof RegisterValues, fieldError)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('auth:registerTitle')}
        subtitle={t('auth:registerSubtitle')}
      />

      {alert ? <Alert variant="error">{alert}</Alert> : null}

      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setAlert(undefined)
          registerMutation.mutate(
            {
              name: values.name.trim(),
              phone: normalizePhone(values.phone),
              email: values.email.trim().toLowerCase(),
              password: values.password,
            },
            {
              onSuccess(_response, variables) {
                storage.setPendingEmail(variables.email)
                onSuccess?.(variables.email)
              },
              onError: handleError,
            },
          )
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          id="name"
          label={t('auth:fullName')}
          error={errors.name?.message ? translate(t, errors.name.message) : undefined}
        >
          {(describedBy) => (
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy}
              {...register('name')}
            />
          )}
        </FormField>

        <FormField
          id="phone"
          label={t('auth:phone')}
          // hint={t('auth:phoneHint')}
          error={errors.phone?.message ? translate(t, errors.phone.message) : undefined}
        >
          {(describedBy) => (
            <PhoneInput
              id="phone"
              error={errors.phone?.message}
              inputProps={{ ...register('phone'), 'aria-describedby': describedBy }}
            />
          )}
        </FormField>

        <FormField
          id="email"
          label={t('common:email')}
          error={errors.email?.message ? translate(t, errors.email.message) : undefined}
        >
          {(describedBy) => (
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy}
              {...register('email')}
            />
          )}
        </FormField>

        <div className="flex flex-col gap-2">
          <FormField
            id="password"
            label={t('auth:password')}
            error={
              errors.password?.message ? translate(t, errors.password.message) : undefined
            }
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
          <PasswordChecklist value={password} />
        </div>

        <FormField
          id="confirmPassword"
          label={t('auth:confirmPassword')}
          error={
            errors.confirmPassword?.message
              ? translate(t, errors.confirmPassword.message)
              : undefined
          }
        >
          {(describedBy) => (
            <PasswordInput
              id="confirmPassword"
              error={errors.confirmPassword?.message}
              showLabel={t('auth:showPassword')}
              hideLabel={t('auth:hidePassword')}
              inputProps={{
                ...register('confirmPassword'),
                autoComplete: 'new-password',
                'aria-describedby': describedBy,
              }}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {t('auth:createAccount')}
        </Button>
      </form>

      <p className="text-center font-ui text-sm text-charcoal-500">
        <Link to={paths.login} className="font-semibold text-primary underline underline-offset-4">
          {t('auth:login')}
        </Link>
      </p>
    </div>
  )
}
