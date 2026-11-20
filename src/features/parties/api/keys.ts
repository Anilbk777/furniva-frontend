import type {
  PartyListFilters,
  PartyTransactionListFilters,
} from 'src/features/parties/types'

export const partyKeys = {
  all: ['parties'] as const,
  overview: ['parties', 'overview'] as const,
  list: (filters: PartyListFilters) => ['parties', 'list', filters] as const,
  detail: (partyId: string) => ['parties', 'detail', partyId] as const,
}

export const partyTypeKeys = {
  all: ['party-types'] as const,
  list: () => ['party-types', 'list'] as const,
}

export const partyTransactionKeys = {
  all: ['party-transactions'] as const,
  list: (filters: PartyTransactionListFilters) =>
    ['party-transactions', 'list', filters] as const,
}
