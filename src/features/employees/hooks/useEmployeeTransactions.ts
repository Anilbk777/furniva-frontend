import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { transactionKeys } from 'src/features/employees/api/keys'
import { listEmployeeTransactions } from 'src/features/employees/api/transactionsApi'
import type { TransactionListFilters } from 'src/features/employees/types'

export function useEmployeeTransactions(filters: TransactionListFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async () => (await listEmployeeTransactions(filters)).data,
    enabled: Boolean(filters.employeeId),
    placeholderData: keepPreviousData,
  })
}
