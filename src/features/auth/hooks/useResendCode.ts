import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { resendVerification } from 'src/features/auth/api/authApi'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { storage } from 'src/lib/storage'
import { RESEND_COOLDOWN_MS } from 'src/features/auth/utils/constants'

export function useResendCode() {
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: resendVerification,
    onSuccess() {
      storage.setOtpCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
      toast.success(t('resendNeutral'))
    },
    onError(error: unknown) {
      if (mapApiError(error).status === 429) {
        storage.setOtpCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
      }
    },
  })
}
