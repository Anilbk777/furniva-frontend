import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type { PartyType, PartyTypeInput } from 'src/features/parties/types'

export function listPartyTypes(): Promise<ApiResponse<PartyType[]>> {
  return http.get<ApiResponse<PartyType[]>>('/party-types').then((r) => r.data)
}

export function createPartyType(input: PartyTypeInput): Promise<ApiResponse<PartyType>> {
  return http.post<ApiResponse<PartyType>>('/party-types', input).then((r) => r.data)
}

export function updatePartyType(
  typeId: string,
  input: PartyTypeInput,
): Promise<ApiResponse<PartyType>> {
  return http.patch<ApiResponse<PartyType>>(`/party-types/${typeId}`, input).then((r) => r.data)
}

export function deletePartyType(typeId: string): Promise<ApiResponse<null>> {
  return http.delete<ApiResponse<null>>(`/party-types/${typeId}`).then((r) => r.data)
}
