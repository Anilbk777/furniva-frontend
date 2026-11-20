import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { loginWithNext } from 'src/lib/paths'
import { PageLoader } from 'src/components/layout/PageLoader'
import { useMe } from 'src/features/auth/hooks/useMe'

export function RequireAuth() {
  const me = useMe()
  const location = useLocation()

  if (me.isLoading) return <PageLoader />
  if (!me.data) {
    return <Navigate to={loginWithNext(`${location.pathname}${location.search}`)} replace />
  }
  return <Outlet />
}
