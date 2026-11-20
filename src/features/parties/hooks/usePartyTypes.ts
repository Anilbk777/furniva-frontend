import { useQuery } from '@tanstack/react-query'

import { partyTypeKeys } from 'src/features/parties/api/keys'
import { listPartyTypes } from 'src/features/parties/api/partyTypesApi'

export function usePartyTypes(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: partyTypeKeys.list(),
    queryFn: async () => (await listPartyTypes()).data ?? [],
    enabled: options.enabled ?? true,
  })
}
