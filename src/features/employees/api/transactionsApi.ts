import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  Transaction,
  TransactionInput,
  TransactionListFilters,
  TransactionListResult,
  TransactionUpdateInput,
} from 'src/features/employees/types'

export function createTransaction(
  input: TransactionInput,
): Promise<ApiResponse<Transaction>> {
  return http.post<ApiResponse<Transaction>>('/transactions', input).then((r) => r.data)
}

export function updateTransaction(
  transactionId: string,
  input: TransactionUpdateInput,
): Promise<ApiResponse<Transaction>> {
  return http
    .patch<ApiResponse<Transaction>>(`/transactions/${transactionId}`, input)
    .then((r) => r.data)
}

export function deleteTransaction(transactionId: string): Promise<ApiResponse<null>> {
  return http
    .delete<ApiResponse<null>>(`/transactions/${transactionId}`)
    .then((r) => r.data)
}

export function listEmployeeTransactions(
  filters: TransactionListFilters,
): Promise<ApiResponse<TransactionListResult>> {
  return http
    .get<ApiResponse<TransactionListResult>>('/transactions', {
      params: {
        employee_id: filters.employeeId,
        kind: filters.kind,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        page: filters.page,
        limit: filters.limit ?? 10,
      },
    })
    .then((r) => r.data)
}
