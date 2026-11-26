import { useQuery } from '@tanstack/react-query'

import { getCustomersOverview } from 'src/features/customers/api/customersApi'
import { customerKeys } from 'src/features/customers/api/keys'

export function useCustomersOverview() {
  return useQuery({
    queryKey: customerKeys.overview,
    queryFn: async () => (await getCustomersOverview()).data,
  })
}
