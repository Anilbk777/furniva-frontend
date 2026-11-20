import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { verifyEmail } from 'src/features/auth/api/authApi'
import { paths } from 'src/lib/paths'
import { storage } from 'src/lib/storage'

export function useVerifyEmail() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: verifyEmail,
    onSuccess(_response, values) {
      storage.clearSession()
      toast.success(t('verifySuccess'))
      navigate(`${paths.login}?verified=1`, { state: { email: values.email } })
    },
  })
}
