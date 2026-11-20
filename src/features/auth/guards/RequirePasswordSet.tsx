import { Navigate, Outlet } from 'react-router-dom'

import { paths } from 'src/lib/paths'
import { useMe } from 'src/features/auth/hooks/useMe'

export function RequirePasswordSet() {
  const me = useMe()

  if (me.data?.must_change_password) return <Navigate to={paths.changePassword} replace />
  return <Outlet />
}
