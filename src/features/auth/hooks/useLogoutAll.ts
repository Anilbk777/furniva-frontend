import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { logoutAll } from 'src/features/auth/api/authApi'
import { paths } from 'src/lib/paths'
import { broadcastSessionEnd, clearLocalSession } from 'src/features/auth/hooks/useLogout'

export function useLogoutAll() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: logoutAll,
    onSettled() {
      clearLocalSession()
      broadcastSessionEnd()
      toast.success(t('signOutAllSuccess'))
      navigate(paths.login, { replace: true })
    },
  })
}
