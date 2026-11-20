import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { register } from 'src/features/auth/api/authApi'
import { paths } from 'src/lib/paths'
import { storage } from 'src/lib/storage'
import { RESEND_COOLDOWN_MS } from 'src/features/auth/utils/constants'

export function useRegister() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: register,
    onSuccess(_response, values) {
      const email = values.email.trim().toLowerCase()
      storage.setPendingEmail(email)
      storage.setOtpCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
      toast.success(t('registerSuccess'))
      navigate(paths.verifyEmail, { state: { email } })
    },
  })
}
