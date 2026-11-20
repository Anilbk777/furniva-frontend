import type {
  EmployeeListFilters,
  TransactionListFilters,
} from 'src/features/employees/types'

export const employeeKeys = {
  all: ['employees'] as const,
  overview: ['employees', 'overview'] as const,
  list: (filters: EmployeeListFilters) => ['employees', 'list', filters] as const,
  detail: (employeeId: string) => ['employees', 'detail', employeeId] as const,
}

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionListFilters) => ['transactions', 'list', filters] as const,
}
