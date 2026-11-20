import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { listEmployees } from 'src/features/employees/api/employeesApi'
import { employeeKeys } from 'src/features/employees/api/keys'
import type { EmployeeListFilters } from 'src/features/employees/types'

export function useEmployees(filters: EmployeeListFilters) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: async () => (await listEmployees(filters)).data,
    placeholderData: keepPreviousData,
  })
}
