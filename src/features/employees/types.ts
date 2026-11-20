export interface Employee {
  id: string
  name: string
  phone: string | null
  role_title: string | null
  monthly_salary: number | string | null
  joined_date_bs: string | null
  is_active: boolean
  note: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeInput {
  name: string
  phone?: string | null
  role_title?: string | null
  monthly_salary?: number | null
  joined_date_bs?: string | null
  note?: string | null
}

export interface EmployeeUpdateInput extends Partial<EmployeeInput> {
  is_active?: boolean
}

export interface EmployeeListFilters {
  search?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export interface EmployeeOverview {
  total: number
  active: number
  inactive: number
  active_salary_total: number | string
  inactive_salary_total: number | string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface EmployeeListResult {
  employees: Employee[]
  pagination: Pagination
}

export interface EmployeeBrief {
  id: string
  name: string
  role_title: string | null
  is_active: boolean
}

export interface PartyBrief {
  id: string
  name: string
}

export interface Transaction {
  id: string
  bs_date: string
  kind: string
  amount: number | string
  payment_method: string | null
  note: string | null
  employee: EmployeeBrief | null
  party: PartyBrief | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TransactionTotals {
  count: number
  amounts: Record<string, number | string>
}

export interface TransactionListResult {
  transactions: Transaction[]
  pagination: Pagination
  employee: EmployeeBrief | null
  totals: TransactionTotals
}

export type EmployeeTxKind = 'employee_advance' | 'employee_salary'

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'esewa'
  | 'khalti'
  | 'cheque'
  | 'other'

export const employeeTxKinds: EmployeeTxKind[] = [
  'employee_advance',
  'employee_salary',
]

export const paymentMethods: PaymentMethod[] = [
  'cash',
  'bank_transfer',
  'esewa',
  'khalti',
  'cheque',
  'other',
]

export interface TransactionInput {
  kind: EmployeeTxKind
  bs_date: string
  amount: number
  payment_method: PaymentMethod
  employee_id: string
  note?: string | null
}

export type TransactionUpdateInput = Partial<TransactionInput>

export interface TransactionListFilters {
  employeeId: string
  dateFrom?: string
  dateTo?: string
  kind?: EmployeeTxKind
  page?: number
  limit?: number
}
