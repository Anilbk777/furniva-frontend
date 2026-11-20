import { HttpResponse, http } from 'msw'

import { env } from 'src/lib/env'
import type { OrganizationDetails } from 'src/features/organization/types'
import type { AuthData, MeUser, Organization, User } from 'src/types/api'

interface Account {
  user: MeUser
  password: string
  verified: boolean
  suspended: boolean
  organizationCreatedAt: string | null
  organizationUpdatedAt: string | null
}

const base = `${env.VITE_API_URL}/auth`
const organizationBase = `${env.VITE_API_URL}/organizations`
const accounts = new Map<string, Account>()
let currentUserId: string | null = null
let demoPassword = 'Password1!'

function seedDemo(): void {
  const organization: Organization | null = null
  accounts.clear()
  accounts.set('demo@furniva.local', {
    password: demoPassword,
    verified: true,
    suspended: false,
    user: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Demo User',
      phone: '9841234567',
      email: 'demo@furniva.local',
      role: 'owner',
      is_active: true,
      must_change_password: false,
      email_verified_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      organization,
    },
    organizationCreatedAt: null,
    organizationUpdatedAt: null,
  })
  currentUserId = null
}

seedDemo()

export const mockState = {
  reset(): void {
    demoPassword = 'Password1!'
    seedDemo()
    seedOperations()
  },
  isAuthenticated(): boolean {
    return currentUserId !== null
  },
  setMustChange(value: boolean): void {
    for (const account of accounts.values()) {
      if (account.user.id === currentUserId) account.user.must_change_password = value
    }
  },
  setDemoPassword(value: string): void {
    demoPassword = value
    const account = accounts.get('demo@furniva.local')
    if (account) account.password = value
  },
  setOrganization(organization: Organization | null): void {
    const account = currentAccount() ?? accounts.get('demo@furniva.local')
    if (!account) return
    const now = new Date().toISOString()
    account.user.organization = organization
    account.organizationCreatedAt = organization ? now : null
    account.organizationUpdatedAt = organization ? now : null
  },
}

function ok<T>(data: T | null, message: string, status = 200) {
  return HttpResponse.json(
    { success: true, status_code: status, message, data },
    { status },
  )
}

function fail(message: string, status: number, data: unknown = null) {
  return HttpResponse.json(
    { success: false, status_code: status, message, data },
    { status },
  )
}

function toUser(account: Account): User {
  const user = account.user
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    must_change_password: user.must_change_password,
    email_verified_at: user.email_verified_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

function toOrganizationDetails(account: Account): OrganizationDetails | null {
  const organization = account.user.organization
  if (!organization) return null
  const fallback = new Date().toISOString()
  return {
    ...organization,
    created_at: account.organizationCreatedAt ?? fallback,
    updated_at: account.organizationUpdatedAt ?? account.organizationCreatedAt ?? fallback,
  }
}

function currentAccount(): Account | undefined {
  if (!currentUserId) return undefined
  return [...accounts.values()].find((account) => account.user.id === currentUserId)
}

function readOrganizationName(body: unknown): { name?: string; error?: string } {
  if (typeof body !== 'object' || body === null || !('name' in body)) {
    return { error: 'Name is required' }
  }
  const value = (body as { name: unknown }).name
  if (typeof value !== 'string') return { error: 'Name should be a valid string' }
  const name = value.trim()
  if (!name) return { error: 'Name should have at least 1 character' }
  if (name.length > 120) return { error: 'Name should have at most 120 characters' }
  return { name }
}

function findBy(identifier: string): Account | undefined {
  const normalized = identifier.trim().toLowerCase()
  return [...accounts.values()].find(
    (account) =>
      account.user.email === normalized ||
      account.user.phone === normalized.replace(/[\s\-()]/g, ''),
  )
}

const employeeBase = `${env.VITE_API_URL}/employees`
const transactionBase = `${env.VITE_API_URL}/transactions`

interface MockEmployee {
  id: string
  name: string
  phone: string | null
  role_title: string | null
  monthly_salary: string | null
  joined_date_bs: string | null
  is_active: boolean
  note: string | null
  created_at: string
  updated_at: string
  deleted?: boolean
}

interface MockTransaction {
  id: string
  bs_date: string
  kind: string
  amount: string
  payment_method: string | null
  note: string | null
  employee_id: string
  created_at: string
  updated_at: string
}

let employees: MockEmployee[] = []
let transactions: MockTransaction[] = []

function mockEmployee(
  values: Partial<Omit<MockEmployee, 'id' | 'created_at' | 'updated_at'>> & { name: string },
): MockEmployee {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    phone: null,
    role_title: null,
    monthly_salary: null,
    joined_date_bs: null,
    is_active: true,
    note: null,
    ...values,
    created_at: now,
    updated_at: now,
  }
}

function mockTransaction(
  employeeId: string,
  kind: 'employee_advance' | 'employee_salary',
  amount: string,
  bsDate: string,
  paymentMethod = 'cash',
  note: string | null = null,
): MockTransaction {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    bs_date: bsDate,
    kind,
    amount,
    payment_method: paymentMethod,
    note,
    employee_id: employeeId,
    created_at: now,
    updated_at: now,
  }
}

function seedOperations(): void {
  const sita = mockEmployee({
    name: 'Sita Sharma',
    phone: '9841112233',
    role_title: 'Store manager',
    monthly_salary: '32000.00',
    joined_date_bs: '2081-02-10',
  })
  const ram = mockEmployee({
    name: 'Ram Bahadur Thapa',
    phone: '9851223344',
    role_title: 'Carpenter',
    monthly_salary: '26000.00',
    joined_date_bs: '2082-05-01',
  })
  const gita = mockEmployee({
    name: 'Gita Gurung',
    phone: '9861334455',
    role_title: 'Salesperson',
    monthly_salary: '21000.00',
    joined_date_bs: '2082-11-18',
  })
  const hari = mockEmployee({
    name: 'Hari Prasad Yadav',
    role_title: 'Delivery driver',
    monthly_salary: '19000.00',
    joined_date_bs: '2083-01-05',
  })
  const anjali = mockEmployee({
    name: 'Anjali Karki',
    phone: '9871445566',
    role_title: 'Accountant',
    monthly_salary: '28000.00',
    joined_date_bs: '2080-09-22',
    is_active: false,
    note: 'Left to study abroad.',
  })
  const bikash = mockEmployee({
    name: 'Bikash Adhikari',
    phone: '9801556677',
    role_title: 'Upholsterer',
    joined_date_bs: '2083-07-12',
    is_active: false,
  })

  employees = [sita, ram, gita, hari, anjali, bikash]
  transactions = [
    mockTransaction(sita.id, 'employee_salary', '32000.00', '2083-08-01'),
    mockTransaction(ram.id, 'employee_salary', '26000.00', '2083-08-02', 'bank_transfer'),
    mockTransaction(gita.id, 'employee_advance', '5000.00', '2083-08-02', 'esewa', 'Dashain shopping'),
    mockTransaction(hari.id, 'employee_advance', '3000.00', '2083-08-03'),
    mockTransaction(gita.id, 'employee_salary', '21000.00', '2083-07-30', 'bank_transfer'),
    mockTransaction(hari.id, 'employee_salary', '19000.00', '2083-07-28'),
    mockTransaction(sita.id, 'employee_advance', '8000.00', '2083-07-15', 'khalti'),
    mockTransaction(ram.id, 'employee_advance', '4000.00', '2083-07-11'),
    mockTransaction(anjali.id, 'employee_salary', '28000.00', '2083-06-30', 'cheque'),
  ]
}

function activeMockEmployees(): MockEmployee[] {
  return employees.filter((employee) => !employee.deleted)
}

function toEmployeeRead(employee: MockEmployee) {
  return {
    id: employee.id,
    name: employee.name,
    phone: employee.phone,
    role_title: employee.role_title,
    monthly_salary: employee.monthly_salary,
    joined_date_bs: employee.joined_date_bs,
    is_active: employee.is_active,
    note: employee.note,
    created_at: employee.created_at,
    updated_at: employee.updated_at,
  }
}

function toEmployeeBrief(employee: MockEmployee) {
  return {
    id: employee.id,
    name: employee.name,
    role_title: employee.role_title,
    is_active: employee.is_active,
  }
}

function toTransactionRead(transaction: MockTransaction) {
  const employee = activeMockEmployees().find((item) => item.id === transaction.employee_id)
  return {
    id: transaction.id,
    bs_date: transaction.bs_date,
    kind: transaction.kind,
    amount: transaction.amount,
    payment_method: transaction.payment_method,
    note: transaction.note,
    employee: employee ? toEmployeeBrief(employee) : null,
    party: null,
    created_by: null,
    created_at: transaction.created_at,
    updated_at: transaction.updated_at,
  }
}

function paginate<T>(items: T[], page: number, limit: number) {
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: {
      total: items.length,
      page,
      limit,
      total_pages: Math.ceil(items.length / limit),
    },
  }
}

function filterTransactions(params: URLSearchParams): MockTransaction[] {
  const kind = params.get('kind')
  const employeeId = params.get('employee_id')
  const dateFrom = params.get('date_from')
  const dateTo = params.get('date_to')
  const knownEmployeeIds = new Set(activeMockEmployees().map((employee) => employee.id))
  return transactions
    .filter((transaction) => knownEmployeeIds.has(transaction.employee_id))
    .filter((transaction) => (kind ? transaction.kind === kind : true))
    .filter((transaction) => (employeeId ? transaction.employee_id === employeeId : true))
    .filter((transaction) => (dateFrom ? transaction.bs_date >= dateFrom : true))
    .filter((transaction) => (dateTo ? transaction.bs_date <= dateTo : true))
    .sort(
      (left, right) =>
        right.bs_date.localeCompare(left.bs_date) ||
        right.created_at.localeCompare(left.created_at),
    )
}

seedOperations()

export const handlers = [
  http.post(`${base}/register`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      phone: string
      email: string
      password: string
    }
    if ([...accounts.values()].some((account) => account.user.email === body.email)) {
      return fail('A user with this email already exists', 409)
    }
    if ([...accounts.values()].some((account) => account.user.phone === body.phone)) {
      return fail('A user with this phone number already exists', 409)
    }
    accounts.set(body.email, {
      password: body.password,
      verified: false,
      suspended: false,
      user: {
        id: crypto.randomUUID(),
        name: body.name,
        phone: body.phone,
        email: body.email,
        role: 'owner',
        is_active: true,
        must_change_password: false,
        email_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
        organization: null,
      },
      organizationCreatedAt: null,
      organizationUpdatedAt: null,
    })
    return ok(null, 'Account created. Enter the code sent to your email', 201)
  }),

  http.post(`${base}/verify-email`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string }
    if (body.code !== '123456') return fail('Invalid or expired code', 400)
    const account = accounts.get(body.email)
    if (account) {
      account.verified = true
      account.user.email_verified_at = new Date().toISOString()
    }
    return ok(null, 'Email verified. You can login now.')
  }),

  http.post(`${base}/resend-verification`, () =>
    ok(null, 'If this email needs verification, a new code was sent'),
  ),

  http.post(`${base}/login`, async ({ request }) => {
    const body = (await request.json()) as { identifier: string; password: string }
    const account = findBy(body.identifier)
    if (!account || account.password !== body.password) {
      return fail('Invalid credentials', 401)
    }
    if (account.suspended) {
      return fail('Your account has been suspended', 403, { code: 'ACCOUNT_SUSPENDED' })
    }
    if (!account.verified) {
      return fail('Please verify your email before logging in', 403, {
        code: 'EMAIL_NOT_VERIFIED',
      })
    }
    currentUserId = account.user.id
    const data: AuthData = { user: toUser(account), tokens: null }
    return ok(data, 'Login successful')
  }),

  http.get(`${base}/me`, () => {
    const account = currentAccount()
    if (!account) return fail('Not authenticated', 401)
    return ok(account.user, 'User data fetched successfully')
  }),

  http.post(`${base}/refresh`, () => {
    if (!currentUserId) return fail('Refresh token missing', 401)
    return ok(null, 'Token refreshed')
  }),

  http.post(`${base}/logout`, () => {
    currentUserId = null
    return ok(null, 'Logged out')
  }),

  http.post(`${base}/logout-all`, () => {
    currentUserId = null
    return ok(null, 'Logged out from all devices')
  }),

  http.post(`${base}/forgot-password`, () =>
    ok(null, 'If an account exists for this email, a reset link was sent'),
  ),

  http.post(`${base}/reset-password`, async ({ request }) => {
    const body = (await request.json()) as { token: string; new_password: string }
    if (body.token.length < 20) return fail('This reset link is invalid or has expired', 400)
    return ok(null, 'Password reset. You can now log in with your new password')
  }),

  http.post(`${base}/change-password`, async ({ request }) => {
    const account = currentAccount()
    if (!account) return fail('Not authenticated', 401)
    const body = (await request.json()) as {
      current_password?: string
      new_password: string
    }
    if (!account.user.must_change_password && body.current_password !== account.password) {
      return fail('Current password is incorrect', 400)
    }
    account.password = body.new_password
    account.user.must_change_password = false
    const data: AuthData = { user: toUser(account), tokens: null }
    return ok(data, 'Password updated')
  }),

  http.post(organizationBase, async ({ request }) => {
    const account = currentAccount()
    if (!account) return fail('Not authenticated', 401)
    if (account.user.organization) return fail('You already have an organization', 409)
    const { name, error } = readOrganizationName(await request.json())
    if (error || !name) return fail(error ?? 'Name is required', 422)
    const now = new Date().toISOString()
    account.user.organization = { id: crypto.randomUUID(), name, is_active: true }
    account.organizationCreatedAt = now
    account.organizationUpdatedAt = now
    return ok(toOrganizationDetails(account), 'Organization created', 201)
  }),

  http.get(organizationBase, () => {
    const account = currentAccount()
    if (!account) return fail('Not authenticated', 401)
    const organization = toOrganizationDetails(account)
    if (!organization) return fail('Organization not found', 404)
    return ok(organization, 'Organization fetched')
  }),

  http.patch(organizationBase, async ({ request }) => {
    const account = currentAccount()
    if (!account) return fail('Not authenticated', 401)
    if (!account.user.organization) return fail('Organization not found', 404)
    const { name, error } = readOrganizationName(await request.json())
    if (error || !name) return fail(error ?? 'Name is required', 422)
    account.user.organization = { ...account.user.organization, name }
    account.organizationUpdatedAt = new Date().toISOString()
    return ok(toOrganizationDetails(account), 'Organization updated')
  }),

  http.get(`${employeeBase}/overview`, () => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const visible = activeMockEmployees()
    const active = visible.filter((employee) => employee.is_active)
    const inactive = visible.filter((employee) => !employee.is_active)
    const salaryTotal = (list: MockEmployee[]) =>
      list
        .reduce((total, employee) => total + Number(employee.monthly_salary ?? 0), 0)
        .toFixed(2)
    return ok(
      {
        total: visible.length,
        active: active.length,
        inactive: inactive.length,
        active_salary_total: salaryTotal(active),
        inactive_salary_total: salaryTotal(inactive),
      },
      'Employee overview fetched',
    )
  }),

  http.get(employeeBase, ({ request }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const params = new URL(request.url).searchParams
    const search = (params.get('search') ?? '').trim().toLowerCase()
    const activeParam = params.get('is_active')
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const limit = Math.max(1, Number(params.get('limit') ?? 20))

    const filtered = activeMockEmployees()
      .filter((employee) => (search ? employee.name.toLowerCase().includes(search) : true))
      .filter((employee) =>
        activeParam === 'true'
          ? employee.is_active
          : activeParam === 'false'
            ? !employee.is_active
            : true,
      )
      .sort((left, right) => right.created_at.localeCompare(left.created_at))

    const { items, pagination } = paginate(filtered, page, limit)
    return ok(
      { employees: items.map(toEmployeeRead), pagination },
      'Employees fetched',
    )
  }),

  http.post(employeeBase, async ({ request }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const body = (await request.json()) as {
      name?: string
      phone?: string | null
      role_title?: string | null
      monthly_salary?: number | string | null
      joined_date_bs?: string | null
      note?: string | null
    }
    const name = (body.name ?? '').trim()
    if (!name) return fail('Name should have at least 1 character', 422)
    if (name.length > 120) return fail('Name should have at most 120 characters', 422)
    const employee = mockEmployee({
      name,
      phone: body.phone?.trim() || null,
      role_title: body.role_title?.trim() || null,
      monthly_salary:
        body.monthly_salary === null || body.monthly_salary === undefined
          ? null
          : Number(body.monthly_salary).toFixed(2),
      joined_date_bs: body.joined_date_bs || null,
      note: body.note?.trim() || null,
    })
    employees.push(employee)
    return ok(toEmployeeRead(employee), 'Employee created', 201)
  }),

  http.get(`${employeeBase}/:employeeId`, ({ params }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const employee = activeMockEmployees().find((item) => item.id === params.employeeId)
    if (!employee) return fail('Employee not found', 404)
    return ok(toEmployeeRead(employee), 'Employee fetched')
  }),

  http.patch(`${employeeBase}/:employeeId`, async ({ request, params }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const employee = activeMockEmployees().find((item) => item.id === params.employeeId)
    if (!employee) return fail('Employee not found', 404)
    const body = (await request.json()) as Record<string, unknown>

    if ('name' in body) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) return fail('name cannot be null', 422)
      employee.name = name
    }
    if ('phone' in body) {
      employee.phone = typeof body.phone === 'string' && body.phone ? body.phone : null
    }
    if ('role_title' in body) {
      employee.role_title =
        typeof body.role_title === 'string' && body.role_title ? body.role_title : null
    }
    if ('monthly_salary' in body) {
      employee.monthly_salary =
        body.monthly_salary === null ? null : Number(body.monthly_salary).toFixed(2)
    }
    if ('joined_date_bs' in body) {
      employee.joined_date_bs =
        typeof body.joined_date_bs === 'string' && body.joined_date_bs
          ? body.joined_date_bs
          : null
    }
    if ('note' in body) {
      employee.note = typeof body.note === 'string' && body.note ? body.note : null
    }
    if (typeof body.is_active === 'boolean') {
      employee.is_active = body.is_active
    }
    employee.updated_at = new Date().toISOString()
    return ok(toEmployeeRead(employee), 'Employee updated')
  }),

  http.delete(`${employeeBase}/:employeeId`, ({ params }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const employee = activeMockEmployees().find((item) => item.id === params.employeeId)
    if (!employee) return fail('Employee not found', 404)
    employee.deleted = true
    employee.updated_at = new Date().toISOString()
    return ok(null, 'Employee deleted')
  }),

  http.get(transactionBase, ({ request }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const params = new URL(request.url).searchParams
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const limit = Math.max(1, Number(params.get('limit') ?? 20))
    const filtered = filterTransactions(params)
    const { items, pagination } = paginate(filtered, page, limit)
    const amounts: Record<string, string> = {}
    for (const transaction of filtered) {
      const current = Number(amounts[transaction.kind] ?? 0)
      amounts[transaction.kind] = (current + Number(transaction.amount)).toFixed(2)
    }
    const employeeId = params.get('employee_id')
    const employee =
      employeeId ? activeMockEmployees().find((item) => item.id === employeeId) : undefined
    return ok(
      {
        transactions: items.map(toTransactionRead),
        pagination,
        employee: employee ? toEmployeeBrief(employee) : null,
        totals: { count: filtered.length, amounts },
      },
      'Transactions fetched',
    )
  }),

  http.post(transactionBase, async ({ request }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const body = (await request.json()) as {
      kind?: string
      bs_date?: string
      amount?: number | string
      payment_method?: string | null
      employee_id?: string
      note?: string | null
    }
    const employee = activeMockEmployees().find((item) => item.id === body.employee_id)
    if (!employee) return fail('Employee not found', 404)
    if (body.kind !== 'employee_advance' && body.kind !== 'employee_salary') {
      return fail('unknown transaction kind', 422)
    }
    const amount = Number(body.amount)
    if (!(amount > 0)) return fail('Amount must be greater than zero', 422)
    if (!body.bs_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.bs_date)) {
      return fail('bs_date must be a BS date like 2083-08-03', 422)
    }
    const transaction = mockTransaction(
      employee.id,
      body.kind,
      amount.toFixed(2),
      body.bs_date,
      body.payment_method ?? 'cash',
      body.note?.trim() || null,
    )
    transactions.push(transaction)
    return ok(toTransactionRead(transaction), 'Transaction created', 201)
  }),

  http.patch(`${transactionBase}/:transactionId`, async ({ request, params }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const transaction = transactions.find((item) => item.id === params.transactionId)
    if (!transaction) return fail('Transaction not found', 404)
    const body = (await request.json()) as {
      kind?: string
      bs_date?: string
      amount?: number | string
      payment_method?: string | null
      employee_id?: string
      note?: string | null
    }
    if (body.kind !== undefined) {
      if (body.kind !== 'employee_advance' && body.kind !== 'employee_salary') {
        return fail('unknown transaction kind', 422)
      }
      transaction.kind = body.kind
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!(amount > 0)) return fail('Amount must be greater than zero', 422)
      transaction.amount = amount.toFixed(2)
    }
    if (body.bs_date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.bs_date)) {
        return fail('bs_date must be a BS date like 2083-08-03', 422)
      }
      transaction.bs_date = body.bs_date
    }
    if (body.employee_id !== undefined) {
      const employee = activeMockEmployees().find((item) => item.id === body.employee_id)
      if (!employee) return fail('Employee not found', 404)
      transaction.employee_id = employee.id
    }
    if ('payment_method' in body) {
      transaction.payment_method = body.payment_method ?? null
    }
    if ('note' in body) {
      transaction.note =
        typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null
    }
    transaction.updated_at = new Date().toISOString()
    return ok(toTransactionRead(transaction), 'Transaction updated')
  }),

  http.delete(`${transactionBase}/:transactionId`, ({ params }) => {
    if (!currentAccount()) return fail('Not authenticated', 401)
    const index = transactions.findIndex((item) => item.id === params.transactionId)
    if (index === -1) return fail('Transaction not found', 404)
    transactions.splice(index, 1)
    return ok(null, 'Transaction deleted')
  }),
]
