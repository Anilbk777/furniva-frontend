import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  Employee,
  EmployeeInput,
  EmployeeListFilters,
  EmployeeListResult,
  EmployeeOverview,
  EmployeeUpdateInput,
} from 'src/features/employees/types'

export function getEmployeesOverview(): Promise<ApiResponse<EmployeeOverview>> {
  return http.get<ApiResponse<EmployeeOverview>>('/employees/overview').then((r) => r.data)
}

export function listEmployees(
  filters: EmployeeListFilters = {},
): Promise<ApiResponse<EmployeeListResult>> {
  return http
    .get<ApiResponse<EmployeeListResult>>('/employees', {
      params: {
        search: filters.search || undefined,
        is_active: filters.is_active,
        page: filters.page,
        limit: filters.limit,
      },
    })
    .then((r) => r.data)
}

export function getEmployee(employeeId: string): Promise<ApiResponse<Employee>> {
  return http.get<ApiResponse<Employee>>(`/employees/${employeeId}`).then((r) => r.data)
}

export function createEmployee(input: EmployeeInput): Promise<ApiResponse<Employee>> {
  return http.post<ApiResponse<Employee>>('/employees', input).then((r) => r.data)
}

export function updateEmployee(
  employeeId: string,
  input: EmployeeUpdateInput,
): Promise<ApiResponse<Employee>> {
  return http
    .patch<ApiResponse<Employee>>(`/employees/${employeeId}`, input)
    .then((r) => r.data)
}

export function deleteEmployee(employeeId: string): Promise<ApiResponse<null>> {
  return http.delete<ApiResponse<null>>(`/employees/${employeeId}`).then((r) => r.data)
}
