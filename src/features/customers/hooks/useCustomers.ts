import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { listCustomers } from 'src/features/customers/api/customersApi'
import { customerKeys } from 'src/features/customers/api/keys'
import type { CustomerListFilters } from 'src/features/customers/types'

export function useCustomers(filters: CustomerListFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async () => (await listCustomers(filters)).data,
    placeholderData: keepPreviousData,
  })
}
