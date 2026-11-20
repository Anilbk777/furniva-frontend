import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { logout } from 'src/features/auth/api/authApi'
import { paths } from 'src/lib/paths'
import { clearSessionCache } from 'src/lib/queryClient'
import { storage } from 'src/lib/storage'
import { SESSION_CHANNEL } from 'src/features/auth/utils/constants'

export function broadcastSessionEnd(): void {
  try {
    const channel = new BroadcastChannel(SESSION_CHANNEL)
    channel.postMessage({ type: 'logout' })
    channel.close()
  } catch {
    return
  }
}

export function clearLocalSession(): void {
  storage.clearSession()
  clearSessionCache()
}

export function useLogout() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: logout,
    onSettled() {
      clearLocalSession()
      broadcastSessionEnd()
      toast.success(t('logoutSuccess'))
      navigate(paths.login, { replace: true })
    },
  })
}
