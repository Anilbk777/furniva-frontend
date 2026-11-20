import { Navigate } from 'react-router-dom'

import { PageLoader } from 'src/components/layout/PageLoader'
import { useMe } from 'src/features/auth'
import { OrganizationInactive } from 'src/features/organization/components/OrganizationInactive'
import { OrganizationSetupForm } from 'src/features/organization/components/OrganizationSetupForm'
import { paths } from 'src/lib/paths'

export function OrganizationSetupPage() {
  const me = useMe()

  if (me.isLoading) return <PageLoader />
  if (me.isError || !me.data) return <Navigate to={paths.login} replace />
  if (me.data.organization && !me.data.organization.is_active) return <OrganizationInactive />
  if (me.data.organization) return <Navigate to={paths.dashboard} replace />

  return <OrganizationSetupForm />
}
