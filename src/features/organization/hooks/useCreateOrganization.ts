import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { authKeys } from 'src/features/auth'
import { createOrganization } from 'src/features/organization/api/organizationApi'
import { organizationKeys } from 'src/features/organization/api/keys'
import { paths } from 'src/lib/paths'
import type { MeUser } from 'src/types/api'

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation('organization')

  return useMutation({
    mutationFn: createOrganization,
    onSuccess(response) {
      const organization = response.data
      if (!organization) return
      const current = queryClient.getQueryData<MeUser>(authKeys.me)
      if (current) {
        queryClient.setQueryData(authKeys.me, {
          ...current,
          organization: {
            id: organization.id,
            name: organization.name,
            is_active: organization.is_active,
          },
        } satisfies MeUser)
      }
      queryClient.setQueryData(organizationKeys.current, organization)
      toast.success(t('createSuccess'))
      navigate(paths.dashboard, { replace: true })
    },
  })
}
