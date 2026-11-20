import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { changePassword } from 'src/features/auth/api/authApi'
import { authKeys } from 'src/features/auth/api/keys'
import { paths } from 'src/lib/paths'

export function useChangePassword() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: changePassword,
    onSuccess(response) {
      const user = response.data?.user
      if (!user) return
      queryClient.removeQueries({ queryKey: authKeys.me })
      toast.success(t('changeSuccess'))
      navigate(paths.dashboard, { replace: true })
    },
  })
}
