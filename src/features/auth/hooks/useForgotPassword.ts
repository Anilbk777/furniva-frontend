import { useMutation } from '@tanstack/react-query'

import { forgotPassword } from 'src/features/auth/api/authApi'
import { mapApiError } from 'src/features/auth/utils/errorMap'
import { storage } from 'src/lib/storage'
import { RESEND_COOLDOWN_MS } from 'src/features/auth/utils/constants'

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess() {
      storage.setOtpCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
    },
    onError(error: unknown) {
      if (mapApiError(error).status === 429) {
        storage.setOtpCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
      }
    },
  })
}
