import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { listOrders } from 'src/features/orders/api/ordersApi'
import { orderKeys } from 'src/features/orders/api/keys'
import type { OrderListFilters } from 'src/features/orders/types'

export function useOrders(filters: OrderListFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => (await listOrders(filters)).data,
    placeholderData: keepPreviousData,
  })
}
