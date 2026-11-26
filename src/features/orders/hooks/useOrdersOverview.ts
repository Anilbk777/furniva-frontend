import { useQuery } from '@tanstack/react-query'

import { getOrdersOverview } from 'src/features/orders/api/ordersApi'
import { orderKeys } from 'src/features/orders/api/keys'

export function useOrdersOverview() {
  return useQuery({
    queryKey: orderKeys.overview,
    queryFn: async () => (await getOrdersOverview()).data,
  })
}
