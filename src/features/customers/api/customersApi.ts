import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  Customer,
  CustomerInput,
  CustomerListFilters,
  CustomerListResult,
  CustomerOverview,
  CustomerUpdateInput,
} from 'src/features/customers/types'

export function getCustomersOverview(): Promise<ApiResponse<CustomerOverview>> {
  return http.get<ApiResponse<CustomerOverview>>('/customers/overview').then((r) => r.data)
}

export function listCustomers(
  filters: CustomerListFilters = {},
): Promise<ApiResponse<CustomerListResult>> {
  return http
    .get<ApiResponse<CustomerListResult>>('/customers', {
      params: {
        search: filters.search || undefined,
        customer_type: filters.customer_type || undefined,
        is_active: filters.is_active,
        page: filters.page,
        limit: filters.limit,
      },
    })
    .then((r) => r.data)
}

export function getCustomer(customerId: string): Promise<ApiResponse<Customer>> {
  return http.get<ApiResponse<Customer>>(`/customers/${customerId}`).then((r) => r.data)
}

export function createCustomer(input: CustomerInput): Promise<ApiResponse<Customer>> {
  return http.post<ApiResponse<Customer>>('/customers', input).then((r) => r.data)
}

export function updateCustomer(
  customerId: string,
  input: CustomerUpdateInput,
): Promise<ApiResponse<Customer>> {
  return http
    .patch<ApiResponse<Customer>>(`/customers/${customerId}`, input)
    .then((r) => r.data)
}

export function deleteCustomer(customerId: string): Promise<ApiResponse<null>> {
  return http.delete<ApiResponse<null>>(`/customers/${customerId}`).then((r) => r.data)
}
