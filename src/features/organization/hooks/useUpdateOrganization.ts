import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { authKeys } from 'src/features/auth'
import { updateOrganization } from 'src/features/organization/api/organizationApi'
import { organizationKeys } from 'src/features/organization/api/keys'
import type { MeUser } from 'src/types/api'

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('organization')

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess(response) {
      const organization = response.data
      if (!organization) return
      queryClient.setQueryData(organizationKeys.current, organization)
      const current = queryClient.getQueryData<MeUser>(authKeys.me)
      if (current?.organization) {
        queryClient.setQueryData(authKeys.me, {
          ...current,
          organization: {
            ...current.organization,
            name: organization.name,
            is_active: organization.is_active,
          },
        } satisfies MeUser)
      }
      toast.success(t('updateSuccess'))
    },
  })
}
