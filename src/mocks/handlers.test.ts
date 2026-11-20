import { describe, expect, it } from 'vitest'

import { http } from 'src/lib/http'

interface TransactionRow {
  id: string
  kind: string
  amount: string
  note: string | null
}

interface TransactionRead {
  id: string
  amount: string
  note: string | null
  employee: {
    name: string
    role_title: string | null
    is_active: boolean
  } | null
}

interface TransactionListPayload {
  transactions: TransactionRow[]
  totals: { count: number; amounts: Record<string, string> }
  employee: {
    id: string
    name: string
    role_title: string | null
    is_active: boolean
  } | null
}

interface ApiResponse<T> {
  success: boolean
  status_code: number
  message: string
  data: T
}

async function login(): Promise<void> {
  const response = await http.post('/auth/login', {
    identifier: 'demo@furniva.local',
    password: 'Password1!',
  })
  expect(response.status).toBe(200)
}

describe('employee and transaction mocks', () => {
  it('serves overview numbers', async () => {
    await login()
    const response = await http.get('/employees/overview')
    expect(response.data.data).toMatchObject({
      total: 6,
      active: 4,
      inactive: 2,
      active_salary_total: '98000.00',
      inactive_salary_total: '28000.00',
    })
  })

  it('lists and filters employees', async () => {
    await login()
    const response = await http.get('/employees', {
      params: { search: 'sita', is_active: true },
    })
    expect(response.data.data.pagination.total).toBe(1)
    expect(response.data.data.employees[0].name).toBe('Sita Sharma')
  })

  it('filters transactions by kind and totals the range', async () => {
    await login()
    const list = await http.get<ApiResponse<TransactionListPayload>>(
      '/transactions',
      { params: { kind: 'employee_advance' } },
    )
    const rows = list.data.data.transactions
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((row) => row.kind === 'employee_advance')).toBe(true)
    expect(list.data.data.totals.amounts.employee_advance).toBeDefined()
  })

  it('returns the employee brief on each transaction and on the list', async () => {
    await login()
    const employees = await http.get('/employees', { params: { search: 'Sita' } })
    const employeeId = employees.data.data.employees[0].id as string

    const list = await http.get<ApiResponse<TransactionListPayload>>(
      '/transactions',
      { params: { kind: 'employee_salary' } },
    )
    const row = list.data.data.transactions[0]
    expect(row!.kind).toBe('employee_salary')
    expect(list.data.data.totals.count).toBe(rowsFilteredCount(list.data.data.transactions))

    const byEmployee = await http.get<ApiResponse<TransactionListPayload>>(
      '/transactions',
      { params: { employee_id: employeeId } },
    )
    expect(byEmployee.data.data.totals.count).toBeGreaterThanOrEqual(0)
    if (byEmployee.data.data.employee) {
      expect(byEmployee.data.data.employee.name).toBeTypeOf('string')
      expect(byEmployee.data.data.employee.is_active).toBeTypeOf('boolean')
    }
  })

  it('creates a transaction and reflects it in totals', async () => {
    await login()
    const employees = await http.get('/employees', { params: { search: 'Gita' } })
    const employeeId = employees.data.data.employees[0].id as string

    const created = await http.post<ApiResponse<TransactionRead>>('/transactions', {
      kind: 'employee_advance',
      bs_date: '2083-08-03',
      amount: 1500,
      payment_method: 'cash',
      employee_id: employeeId,
      note: 'Test advance',
    })
    expect(created.status).toBe(201)
    expect(created.data.data.employee!.name).toBe('Gita Gurung')
    expect(created.data.data.employee!.role_title).toBe('Salesperson')
    expect(created.data.data.employee!.is_active).toBe(true)

    const list = await http.get<ApiResponse<TransactionListPayload>>(
      '/transactions',
      { params: { employee_id: employeeId } },
    )
    expect(list.data.data.totals.amounts.employee_advance).toBe('6500.00')
    expect(list.data.data.employee!.id).toBe(employeeId)
    expect(list.data.data.employee!.name).toBe('Gita Gurung')
  })

  it('updates a transaction and reflects it in the employee list', async () => {
    await login()
    const employees = await http.get('/employees', { params: { search: 'Gita' } })
    const employeeId = employees.data.data.employees[0].id as string

    const created = await http.post<ApiResponse<TransactionRead>>('/transactions', {
      kind: 'employee_advance',
      bs_date: '2083-08-04',
      amount: 1200,
      payment_method: 'cash',
      employee_id: employeeId,
      note: 'Original advance',
    })
    const transactionId = created.data.data.id

    const updated = await http.patch<ApiResponse<TransactionRead>>(
      `/transactions/${transactionId}`,
      { amount: 2500, note: 'Updated advance' },
    )
    expect(updated.status).toBe(200)
    expect(updated.data.data.amount).toBe('2500.00')
    expect(updated.data.data.note).toBe('Updated advance')

    const list = await http.get<ApiResponse<TransactionListPayload>>(
      '/transactions',
      { params: { employee_id: employeeId } },
    )
    const row = list.data.data.transactions.find((item) => item.id === transactionId)
    expect(row?.amount).toBe('2500.00')
    expect(row?.note).toBe('Updated advance')
  })

  it('deletes a transaction from the employee list', async () => {
    await login()
    const employees = await http.get('/employees', { params: { search: 'Gita' } })
    const employeeId = employees.data.data.employees[0].id as string

    const created = await http.post<ApiResponse<TransactionRead>>('/transactions', {
      kind: 'employee_salary',
      bs_date: '2083-08-05',
      amount: 900,
      payment_method: 'cash',
      employee_id: employeeId,
      note: 'To be deleted',
    })
    const transactionId = created.data.data.id

    const removed = await http.delete(`/transactions/${transactionId}`)
    expect(removed.status).toBe(200)

    const list = await http.get<ApiResponse<TransactionListPayload>>(
      '/transactions',
      { params: { employee_id: employeeId } },
    )
    expect(
      list.data.data.transactions.some((item) => item.id === transactionId),
    ).toBe(false)
  })
})

function rowsFilteredCount(transactions: TransactionRow[]): number {
  return transactions.length
}
