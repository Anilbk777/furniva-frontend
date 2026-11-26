import type { OrderListFilters } from 'src/features/orders/types'

export const orderKeys = {
  all: ['orders'] as const,
  overview: ['orders', 'overview'] as const,
  list: (filters: OrderListFilters) => ['orders', 'list', filters] as const,
  detail: (orderId: string) => ['orders', 'detail', orderId] as const,
}
