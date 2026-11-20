import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'
import { useCountdown } from 'src/features/auth/hooks/useCountdown'
import { useForgotPassword } from 'src/features/auth/hooks/useForgotPassword'
import { emailSchemaOnly, type EmailValues } from 'src/features/auth/schemas/auth.schemas'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { RESEND_COOLDOWN_MS } from 'src/features/auth/utils/constants'
import { paths } from 'src/lib/paths'
import { storage } from 'src/lib/storage'
import { translate } from 'src/lib/i18n'

function nextCooldown(): number {
  return Date.now() + RESEND_COOLDOWN_MS
}

export function ForgotPasswordForm() {
  const { t } = useTranslation(['auth', 'errors', 'common'])
  const forgot = useForgotPassword()
  const [until, setUntil] = useState(() => storage.getOtpCooldownUntil())
  const [sent, setSent] = useState(false)
  const remaining = useCountdown(until)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchemaOnly),
    defaultValues: { email: '' },
  })

  function restart(): void {
    const next = nextCooldown()
    storage.setOtpCooldownUntil(next)
    setUntil(next)
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('auth:forgotTitle')}
        subtitle={t('auth:forgotSubtitle')}
      />

      {sent ? <Alert variant="success">{t('auth:forgotNeutral')}</Alert> : null}

      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          forgot.mutate(
            { email: values.email },
            {
              onSuccess() {
                setSent(true)
                restart()
              },
              onError(error: unknown) {
                setSent(true)
                if (mapApiError(error).status === 429) restart()
              },
            },
          )
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          id="forgot-email"
          label={t('common:email')}
          error={
            errors.email?.message ? translate(t, errors.email.message) : undefined
          }
        >
          {(describedBy) => (
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy}
              {...register('email')}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" disabled={forgot.isPending || remaining > 0}>
          {remaining > 0 ? t('auth:resendIn', { seconds: remaining }) : t('auth:sendMeACode')}
        </Button>
      </form>

      <Link
        to={paths.login}
        className="text-center font-ui text-sm font-semibold text-primary underline underline-offset-4"
      >
        {t('auth:login')}
      </Link>
    </div>
  )
}
