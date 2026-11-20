import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { authKeys } from 'src/features/auth/api/keys'
import { paths } from 'src/lib/paths'
import type { MeUser } from 'src/types/api'

export function GuestOnly() {
  const queryClient = useQueryClient()
  const me = queryClient.getQueryData<MeUser>(authKeys.me)

  if (me) return <Navigate to={paths.dashboard} replace />
  return <Outlet />
}
