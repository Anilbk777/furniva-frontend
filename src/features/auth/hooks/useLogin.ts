import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import { login } from 'src/features/auth/api/authApi'
import { authKeys } from 'src/features/auth/api/keys'
import { paths, safeNext } from 'src/lib/paths'

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: login,
    onSuccess(response) {
      const user = response.data?.user
      if (!user) return
      queryClient.removeQueries({ queryKey: authKeys.me })
      if (user.must_change_password) {
        navigate(paths.changePassword, { replace: true })
        return
      }
      const next = safeNext(new URLSearchParams(location.search).get('next'))
      navigate(next ?? paths.dashboard, { replace: true })
    },
  })
}
