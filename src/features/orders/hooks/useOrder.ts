import { useQuery } from '@tanstack/react-query'

import { getOrder } from 'src/features/orders/api/ordersApi'
import { orderKeys } from 'src/features/orders/api/keys'

export function useOrder(
  orderId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled = Boolean(orderId) && (options.enabled ?? true)
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ''),
    queryFn: async () => (await getOrder(orderId ?? '')).data,
    enabled,
  })
}
