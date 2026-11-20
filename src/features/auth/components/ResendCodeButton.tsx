import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useResendCode } from 'src/features/auth/hooks/useResendCode'
import { useCountdown } from 'src/features/auth/hooks/useCountdown'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { RESEND_COOLDOWN_MS } from 'src/features/auth/utils/constants'
import { storage } from 'src/lib/storage'
import { Button } from 'src/components/ui/Button'

function nextCooldown(): number {
  return Date.now() + RESEND_COOLDOWN_MS
}

export interface ResendCodeButtonProps {
  email: string
  className?: string
}

export function ResendCodeButton({ email, className }: ResendCodeButtonProps) {
  const [until, setUntil] = useState(() => storage.getOtpCooldownUntil())
  const remaining = useCountdown(until)
  const resend = useResendCode()
  const { t } = useTranslation('auth')

  function restart(): void {
    const next = nextCooldown()
    storage.setOtpCooldownUntil(next)
    setUntil(next)
  }

  return (
    <Button
      variant="secondary"
      className={className}
      disabled={!email || remaining > 0 || resend.isPending}
      onClick={() => {
        resend.mutate(
          { email },
          {
            onSuccess: restart,
            onError(error: unknown) {
              if (mapApiError(error).status === 429) restart()
            },
          },
        )
      }}
    >
      {remaining > 0 ? t('resendIn', { seconds: remaining }) : t('resendCode')}
    </Button>
  )
}
