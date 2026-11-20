import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'
import { PasswordChecklist } from 'src/features/auth/components/PasswordChecklist'
import { PasswordInput } from 'src/features/auth/components/PasswordInput'
import { useChangePassword } from 'src/features/auth/hooks/useChangePassword'
import { useMe } from 'src/features/auth/hooks/useMe'
import { makeChangePasswordSchema } from 'src/features/auth/schemas/auth.schemas'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { PageLoader } from 'src/components/layout/PageLoader'
import { translate } from 'src/lib/i18n'

interface ChangePasswordValues {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}

export function ChangePasswordForm() {
  const { t } = useTranslation(['auth', 'errors', 'common'])
  const me = useMe()
  const change = useChangePassword()
  const [alert, setAlert] = useState<string | undefined>()
  const requireCurrent = !me.data?.must_change_password
  const schema = useMemo(() => makeChangePasswordSchema(requireCurrent), [requireCurrent])
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control, name: 'newPassword' }) ?? ''

  if (me.isLoading) return <PageLoader />

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('auth:changePassword')}
        subtitle={
          me.data?.must_change_password
            ? t('auth:forcedChangeNotice')
            : t('auth:changeSubtitle')
        }
      />

      {alert ? <Alert variant="error">{alert}</Alert> : null}

      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setAlert(undefined)
          change.mutate(
            {
              new_password: values.newPassword,
              ...(requireCurrent ? { current_password: values.currentPassword } : {}),
            },
            {
              onError(error: unknown) {
                const mapped = mapApiError(error)
                setAlert(translate(t, mapped.messageKey))
                if (mapped.messageKey === 'errors.currentPasswordWrong') {
                  setError('currentPassword', {
                    type: 'server',
                    message: mapped.messageKey,
                  })
                }
              },
            },
          )
        })}
        className="flex flex-col gap-4"
      >
        {requireCurrent ? (
          <FormField
            id="current-password"
            label={t('auth:currentPassword')}
            error={
              errors.currentPassword?.message
                ? translate(t, errors.currentPassword.message)
                : undefined
            }
          >
            {(describedBy) => (
              <PasswordInput
                id="current-password"
                error={errors.currentPassword?.message}
                showLabel={t('auth:showPassword')}
                hideLabel={t('auth:hidePassword')}
                inputProps={{
                  ...register('currentPassword'),
                  autoComplete: 'current-password',
                  'aria-describedby': describedBy,
                }}
              />
            )}
          </FormField>
        ) : null}

        <div className="flex flex-col gap-2">
          <FormField
            id="change-new-password"
            label={t('auth:newPassword')}
            error={
              errors.newPassword?.message ? translate(t, errors.newPassword.message) : undefined
            }
          >
            {(describedBy) => (
              <PasswordInput
                id="change-new-password"
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
          id="change-confirm"
          label={t('auth:confirmPassword')}
          error={
            errors.confirmPassword?.message
              ? translate(t, errors.confirmPassword.message)
              : undefined
          }
        >
          {(describedBy) => (
            <PasswordInput
              id="change-confirm"
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

        <Button type="submit" className="w-full" disabled={change.isPending}>
          {t('auth:changePassword')}
        </Button>
      </form>
    </div>
  )
}
