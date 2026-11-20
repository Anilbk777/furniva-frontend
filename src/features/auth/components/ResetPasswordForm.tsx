import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'
import { PasswordChecklist } from 'src/features/auth/components/PasswordChecklist'
import { PasswordInput } from 'src/features/auth/components/PasswordInput'
import { useResetPassword } from 'src/features/auth/hooks/useResetPassword'
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from 'src/features/auth/schemas/auth.schemas'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { paths } from 'src/lib/paths'
import { translate } from 'src/lib/i18n'

export function ResetPasswordForm() {
  const { t } = useTranslation(['auth', 'errors', 'common'])
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const reset = useResetPassword()
  const [alert, setAlert] = useState<string | undefined>()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control, name: 'newPassword' }) ?? ''

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <AuthFormHeader title={t('auth:resetPassword')} />
        <Alert variant="error">{t('auth:resetLinkInvalid')}</Alert>
        <Link
          to={paths.forgotPassword}
          className="text-center font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('auth:requestNewLink')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('auth:resetPassword')}
        subtitle={t('auth:resetSubtitle')}
      />

      {alert ? <Alert variant="error">{alert}</Alert> : null}

      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setAlert(undefined)
          reset.mutate(
            { token, new_password: values.newPassword },
            {
              onError(error: unknown) {
                setAlert(translate(t, mapApiError(error).messageKey))
              },
            },
          )
        })}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <FormField
            id="new-password"
            label={t('auth:newPassword')}
            error={errors.newPassword?.message ? translate(t, errors.newPassword.message) : undefined}
          >
            {(describedBy) => (
              <PasswordInput
                id="new-password"
                error={errors.newPassword?.message}
                showLabel={t('auth:showPassword')}
                hideLabel={t('auth:hidePassword')}
                inputProps={{ ...register('newPassword'), 'aria-describedby': describedBy }}
              />
            )}
          </FormField>
          <PasswordChecklist value={newPassword} />
        </div>

        <FormField
          id="reset-confirm"
          label={t('auth:confirmPassword')}
          error={
            errors.confirmPassword?.message
              ? translate(t, errors.confirmPassword.message)
              : undefined
          }
        >
          {(describedBy) => (
            <PasswordInput
              id="reset-confirm"
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

        <Button type="submit" className="w-full" disabled={reset.isPending}>
          {t('auth:resetPassword')}
        </Button>
      </form>
    </div>
  )
}
