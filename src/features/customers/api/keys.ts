import type { CustomerListFilters } from 'src/features/customers/types'

export const customerKeys = {
  all: ['customers'] as const,
  overview: ['customers', 'overview'] as const,
  list: (filters: CustomerListFilters) => ['customers', 'list', filters] as const,
  detail: (customerId: string) => ['customers', 'detail', customerId] as const,
}
