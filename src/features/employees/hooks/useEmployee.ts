import { useQuery } from '@tanstack/react-query'

import { getEmployee } from 'src/features/employees/api/employeesApi'
import { employeeKeys } from 'src/features/employees/api/keys'

export function useEmployee(
  employeeId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled = Boolean(employeeId) && (options.enabled ?? true)
  return useQuery({
    queryKey: employeeKeys.detail(employeeId ?? ''),
    queryFn: async () => (await getEmployee(employeeId ?? '')).data,
    enabled,
  })
}
