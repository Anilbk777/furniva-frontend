import { useQuery } from '@tanstack/react-query'

import { getParty } from 'src/features/parties/api/partiesApi'
import { partyKeys } from 'src/features/parties/api/keys'

export function useParty(
  partyId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled = Boolean(partyId) && (options.enabled ?? true)
  return useQuery({
    queryKey: partyKeys.detail(partyId ?? ''),
    queryFn: async () => (await getParty(partyId ?? '')).data,
    enabled,
  })
}
