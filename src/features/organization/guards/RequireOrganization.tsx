import { Navigate, Outlet } from 'react-router-dom'

import { useMe } from 'src/features/auth'
import { OrganizationInactive } from 'src/features/organization/components/OrganizationInactive'
import { PageLoader } from 'src/components/layout/PageLoader'
import { paths } from 'src/lib/paths'

export function RequireOrganization() {
  const me = useMe()

  if (me.isLoading) return <PageLoader />
  if (me.isError || !me.data) return <Navigate to={paths.login} replace />
  if (!me.data.organization) return <Navigate to={paths.organizationSetup} replace />
  if (!me.data.organization.is_active) return <OrganizationInactive />

  return <Outlet />
}
