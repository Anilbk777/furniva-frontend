import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { listParties } from 'src/features/parties/api/partiesApi'
import { partyKeys } from 'src/features/parties/api/keys'
import type { PartyListFilters } from 'src/features/parties/types'

export function useParties(filters: PartyListFilters) {
  return useQuery({
    queryKey: partyKeys.list(filters),
    queryFn: async () => (await listParties(filters)).data,
    placeholderData: keepPreviousData,
  })
}
