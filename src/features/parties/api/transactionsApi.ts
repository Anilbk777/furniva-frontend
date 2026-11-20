import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  PartyTransactionInput,
  PartyTransactionListFilters,
  PartyTransactionUpdateInput,
  Transaction,
  TransactionListResult,
} from 'src/features/parties/types'

export function createPartyTransaction(
  input: PartyTransactionInput,
): Promise<ApiResponse<Transaction>> {
  return http.post<ApiResponse<Transaction>>('/transactions', input).then((r) => r.data)
}

export function updatePartyTransaction(
  transactionId: string,
  input: PartyTransactionUpdateInput,
): Promise<ApiResponse<Transaction>> {
  return http
    .patch<ApiResponse<Transaction>>(`/transactions/${transactionId}`, input)
    .then((r) => r.data)
}

export function deletePartyTransaction(
  transactionId: string,
): Promise<ApiResponse<null>> {
  return http
    .delete<ApiResponse<null>>(`/transactions/${transactionId}`)
    .then((r) => r.data)
}

export function listPartyTransactions(
  filters: PartyTransactionListFilters,
): Promise<ApiResponse<TransactionListResult>> {
  return http
    .get<ApiResponse<TransactionListResult>>('/transactions', {
      params: {
        party_id: filters.partyId,
        kind: filters.kind,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        page: filters.page,
        limit: filters.limit ?? 10,
      },
    })
    .then((r) => r.data)
}
