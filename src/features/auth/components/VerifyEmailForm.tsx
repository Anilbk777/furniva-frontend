import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { AuthFormHeader } from 'src/features/auth/components/AuthFormHeader'
import { OtpInput, type OtpInputHandle } from 'src/features/auth/components/OtpInput'
import { ResendCodeButton } from 'src/features/auth/components/ResendCodeButton'
import { useVerifyEmail } from 'src/features/auth/hooks/useVerifyEmail'
import {
  emailSchemaOnly,
  verifyEmailSchema,
  type EmailValues,
} from 'src/features/auth/schemas/auth.schemas'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { maskEmail } from 'src/features/auth/utils/email'
import { paths } from 'src/lib/paths'
import { translate } from 'src/lib/i18n'

export interface VerifyEmailFormProps {
  email?: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const { t } = useTranslation(['auth', 'errors', 'common'])
  const verifyMutation = useVerifyEmail()
  const otpRef = useRef<OtpInputHandle>(null)
  const [activeEmail, setActiveEmail] = useState(email?.trim().toLowerCase() ?? '')
  const [code, setCode] = useState('')
  const [alert, setAlert] = useState<string | undefined>()

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchemaOnly),
    defaultValues: { email: activeEmail },
  })

  function handleError(error: unknown): void {
    const mapped = mapApiError(error)
    otpRef.current?.clear()
    setCode('')
    setAlert(translate(t, mapped.messageKey))
  }

  if (!activeEmail) {
    return (
      <div className="flex flex-col gap-5">
        <AuthFormHeader title={t('auth:verifyTitle')} subtitle={t('auth:noEmailPrompt')} />
        <form
          noValidate
          onSubmit={emailForm.handleSubmit((values) => setActiveEmail(values.email))}
          className="flex flex-col gap-4"
        >
          <FormField
            id="verify-email"
            label={t('common:email')}
            error={
              emailForm.formState.errors.email?.message
                ? translate(t, emailForm.formState.errors.email.message)
                : undefined
            }
          >
            {(describedBy) => (
              <Input
                id="verify-email"
                type="email"
                autoComplete="email"
                aria-invalid={emailForm.formState.errors.email ? true : undefined}
                aria-describedby={describedBy}
                {...emailForm.register('email')}
              />
            )}
          </FormField>
          <Button type="submit">{t('auth:sendMeACode')}</Button>
        </form>
        <Link
          to={paths.register}
          className="text-center font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('auth:differentEmail')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('auth:verifyTitle')}
        subtitle={t('auth:verifySubtitle', { email: maskEmail(activeEmail) })}
      />

      {alert ? <Alert variant="error">{alert}</Alert> : null}

      <div className="flex flex-col gap-3">
        <OtpInput
          ref={otpRef}
          value={code}
          onChange={(value) => {
            setCode(value)
            setAlert(undefined)
          }}
          onComplete={(value) => {
            const parsed = verifyEmailSchema.safeParse({ email: activeEmail, code: value })
            if (!parsed.success) return
            verifyMutation.mutate(parsed.data, { onError: handleError })
          }}
          disabled={verifyMutation.isPending}
        />
        <p className="font-ui text-xs text-charcoal-500">{t('auth:otpHint')}</p>
      </div>

      <ResendCodeButton email={activeEmail} />

      <Link
        to={paths.register}
        className="text-center font-ui text-sm font-semibold text-primary underline underline-offset-4"
      >
        {t('auth:differentEmail')}
      </Link>
    </div>
  )
}
