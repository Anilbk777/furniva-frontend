import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  Party,
  PartyInput,
  PartyListFilters,
  PartyListResult,
  PartyOverview,
  PartyUpdateInput,
} from 'src/features/parties/types'

export function getPartiesOverview(): Promise<ApiResponse<PartyOverview>> {
  return http.get<ApiResponse<PartyOverview>>('/parties/overview').then((r) => r.data)
}

export function listParties(
  filters: PartyListFilters = {},
): Promise<ApiResponse<PartyListResult>> {
  return http
    .get<ApiResponse<PartyListResult>>('/parties', {
      params: {
        search: filters.search || undefined,
        party_type_id: filters.party_type_id || undefined,
        is_active: filters.is_active,
        page: filters.page,
        limit: filters.limit,
      },
    })
    .then((r) => r.data)
}

export function getParty(partyId: string): Promise<ApiResponse<Party>> {
  return http.get<ApiResponse<Party>>(`/parties/${partyId}`).then((r) => r.data)
}

export function createParty(input: PartyInput): Promise<ApiResponse<Party>> {
  return http.post<ApiResponse<Party>>('/parties', input).then((r) => r.data)
}

export function updateParty(
  partyId: string,
  input: PartyUpdateInput,
): Promise<ApiResponse<Party>> {
  return http.patch<ApiResponse<Party>>(`/parties/${partyId}`, input).then((r) => r.data)
}

export function deleteParty(partyId: string): Promise<ApiResponse<null>> {
  return http.delete<ApiResponse<null>>(`/parties/${partyId}`).then((r) => r.data)
}
