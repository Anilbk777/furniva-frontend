import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { resetPassword } from 'src/features/auth/api/authApi'
import { paths } from 'src/lib/paths'

export function useResetPassword() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: resetPassword,
    onSuccess() {
      toast.success(t('resetSuccess'))
      navigate(paths.login, { replace: true })
    },
  })
}
