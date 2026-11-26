import { useQuery } from '@tanstack/react-query'

import { getCustomer } from 'src/features/customers/api/customersApi'
import { customerKeys } from 'src/features/customers/api/keys'

export function useCustomer(
  customerId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled = Boolean(customerId) && (options.enabled ?? true)
  return useQuery({
    queryKey: customerKeys.detail(customerId ?? ''),
    queryFn: async () => (await getCustomer(customerId ?? '')).data,
    enabled,
  })
}
