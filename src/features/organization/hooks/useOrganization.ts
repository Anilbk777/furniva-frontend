import { useQuery } from '@tanstack/react-query'

import { getOrganization } from 'src/features/organization/api/organizationApi'
import { organizationKeys } from 'src/features/organization/api/keys'

export function useOrganization() {
  return useQuery({
    queryKey: organizationKeys.current,
    queryFn: async () => (await getOrganization()).data,
    retry: false,
  })
}
