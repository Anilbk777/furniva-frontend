import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { partyTransactionKeys } from 'src/features/parties/api/keys'
import { listPartyTransactions } from 'src/features/parties/api/transactionsApi'
import type { PartyTransactionListFilters } from 'src/features/parties/types'

export function usePartyTransactions(filters: PartyTransactionListFilters) {
  return useQuery({
    queryKey: partyTransactionKeys.list(filters),
    queryFn: async () => (await listPartyTransactions(filters)).data,
    enabled: Boolean(filters.partyId),
    placeholderData: keepPreviousData,
  })
}
