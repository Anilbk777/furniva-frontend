import { useQuery } from '@tanstack/react-query'

import { attendanceKeys } from 'src/features/attendance/api/keys'
import { listEmployees } from 'src/features/employees/api/employeesApi'
import type { Employee } from 'src/features/employees/types'

const PAGE_LIMIT = 10

export function useActiveEmployees() {
  return useQuery({
    queryKey: attendanceKeys.employees,
    queryFn: async () => {
      const employees: Employee[] = []
      let page = 1
      let totalPages = 1

      while (page <= totalPages) {
        const response = await listEmployees({
          is_active: true,
          page,
          limit: PAGE_LIMIT,
        })
        const data = response.data
        if (!data) break
        employees.push(...data.employees)
        totalPages = data.pagination.total_pages
        page += 1
      }

      return employees
    },
  })
}
