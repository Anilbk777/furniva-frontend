import { useQuery } from '@tanstack/react-query'

import { getEmployeesOverview } from 'src/features/employees/api/employeesApi'
import { employeeKeys } from 'src/features/employees/api/keys'

export function useEmployeesOverview() {
  return useQuery({
    queryKey: employeeKeys.overview,
    queryFn: async () => (await getEmployeesOverview()).data,
  })
}
