import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  ChevronRight,
  Loader2,
  UserCheck,
  UserPlus,
  UserRoundX,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { Card } from 'src/components/ui/Card'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { SearchInput } from 'src/components/ui/SearchInput'
import { Skeleton } from 'src/components/ui/Skeleton'
import { StatCard } from 'src/components/ui/StatCard'
import { EmployeeForm } from 'src/features/employees/components/EmployeeForm'
import { useCreateEmployee } from 'src/features/employees/hooks/useEmployeeMutations'
import { useEmployees } from 'src/features/employees/hooks/useEmployees'
import { useEmployeesOverview } from 'src/features/employees/hooks/useEmployeesOverview'
import type { Employee, EmployeeInput } from 'src/features/employees/types'
import { mapApiError } from 'src/features/auth'
import { employeeDetail } from 'src/lib/paths'
import { cn } from 'src/lib/cn'
import { formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'

type StatusFilter = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 10

export function EmployeesPage() {
  const { t, i18n } = useTranslation(['employees', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const create = useCreateEmployee()
  const overview = useEmployeesOverview()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const employees = useEmployees({
    search: debouncedSearch || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    page,
    limit: PAGE_SIZE,
  })

  function handleCreate(input: EmployeeInput): void {
    setFormError(undefined)
    create.mutate(input, {
      onSuccess() {
        setFormOpen(false)
        setSearch('')
        setDebouncedSearch('')
        setPage(1)
      },
      onError(error: unknown) {
        setFormError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  const result = employees.data
  const rows = result?.employees ?? []
  const totalPages = result?.pagination.total_pages ?? 1
  // const total = result?.pagination.total ?? 0
  const stats = overview.data
  const statsLoading = overview.isLoading
  const statValue = (value: number | string | undefined): number | string =>
    overview.isError ? '—' : (value ?? 0)
  const filtered = Boolean(debouncedSearch) || status !== 'all'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold text-charcoal sm:text-2xl">
            {t('employees:title')}
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">{t('employees:subtitle')}</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <UserPlus aria-hidden="true" className="size-4" />
          {t('employees:add')}
        </Button>
      </div>

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
        aria-busy={statsLoading || undefined}
      >
        <StatCard
          label={t('employees:overview.total')}
          value={statValue(stats?.total)}
          loading={statsLoading}
          icon={<Users aria-hidden="true" className="size-4" />}
          active={status === 'all'}
          onClick={() => {
            setStatus('all')
            setPage(1)
          }}
        />
        <StatCard
          label={t('employees:overview.active')}
          value={statValue(stats?.active)}
          loading={statsLoading}
          icon={<UserCheck aria-hidden="true" className="size-4" />}
          active={status === 'active'}
          onClick={() => {
            setStatus('active')
            setPage(1)
          }}
        />
        <StatCard
          label={t('employees:overview.inactive')}
          value={statValue(stats?.inactive)}
          loading={statsLoading}
          icon={<UserRoundX aria-hidden="true" className="size-4" />}
          active={status === 'inactive'}
          onClick={() => {
            setStatus('inactive')
            setPage(1)
          }}
          className="col-span-2 md:col-span-1"
        />
        <StatCard
          label={t('employees:overview.activePayroll')}
          value={
            <>
              {overview.isError ? '—' : formatMoney(stats?.active_salary_total ?? null, language)}
              <span className="ml-1 whitespace-nowrap font-ui text-xs font-normal text-charcoal-500">
                {t('employees:overview.perMonth')}
              </span>
            </>
          }
          loading={statsLoading}
          icon={<BriefcaseBusiness aria-hidden="true" className="size-4" />}
          className="col-span-2 md:col-span-1"
        />
        <StatCard
          label={t('employees:overview.inactivePayroll')}
          value={
            <>
              {overview.isError ? '—' : formatMoney(stats?.inactive_salary_total ?? null, language)}
              <span className="ml-1 whitespace-nowrap font-ui text-xs font-normal text-charcoal-500">
                {t('employees:overview.perMonth')}
              </span>
            </>
          }
          loading={statsLoading}
          icon={<BriefcaseBusiness aria-hidden="true" className="size-4" />}
          className="col-span-2 md:col-span-1"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 sm:max-w-md">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder={t('employees:searchPlaceholder')}
            aria-label={t('common:search')}
          />
          {employees.isFetching && !employees.isLoading ? (
            <Loader2
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin text-charcoal-400"
            />
          ) : null}
        </div>
        <div
          role="group"
          aria-label={t('employees:filterLabel')}
          className="grid w-full grid-cols-3 rounded-sm border border-line bg-card-alt p-0.5 sm:inline-flex sm:w-auto"
        >
          {(['all', 'active', 'inactive'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value)
                setPage(1)
              }}
              className={cn(
                'min-h-11 whitespace-nowrap rounded-[3px] px-2 font-ui text-xs font-semibold transition-colors sm:px-3',
                status === value
                  ? 'bg-primary text-white'
                  : 'text-charcoal hover:bg-charcoal-100',
              )}
            >
              {translate(t, `employees.filter.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {employees.isError ? <Alert variant="error">{t('employees:loadError')}</Alert> : null}

      {employees.isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-10 shrink-0 rounded-pill" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden h-4 w-20 md:block" />
                <Skeleton className="h-5 w-16 rounded-pill" />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!employees.isLoading && !employees.isError && rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-pill bg-wood-100 text-primary">
            <Users aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              {filtered ? t('employees:emptyFilteredTitle') : t('employees:emptyTitle')}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {filtered ? t('employees:emptyFilteredBody') : t('employees:emptyBody')}
            </p>
          </div>
          {!filtered ? (
            <Button onClick={() => setFormOpen(true)}>
              <UserPlus aria-hidden="true" className="size-4" />
              {t('employees:add')}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <Card
          className={cn(
            'overflow-hidden transition-opacity',
            employees.isFetching ? 'opacity-60' : '',
          )}
        >
          <ul className="divide-y divide-line md:hidden">
            {rows.map((employee) => (
              <EmployeeMobileRow key={employee.id} employee={employee} language={language} />
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left md:min-w-150">
              <thead className="bg-canvas-alt">
                <tr className="font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('employees:columns.employee')}
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-semibold md:table-cell">
                    {t('employees:columns.role')}
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-semibold lg:table-cell">
                    {t('employees:columns.joined')}
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    {t('employees:columns.salary')}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('employees:columns.status')}
                  </th>
                  <th scope="col" className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} language={language} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {result && totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            className="flex-1 sm:flex-none"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            {t('employees:previous')}
          </Button>
          <span className="order-first w-full text-center font-ui text-sm text-charcoal-500 sm:order-none sm:w-auto">
            {t('employees:pageOf', { page, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            className="flex-1 sm:flex-none"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            {t('employees:next')}
          </Button>
        </div>
      ) : null}

      <Modal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setFormError(undefined)
        }}
      >
        <ModalContent
          title={t('employees:addTitle')}
          description={t('employees:addSubtitle')}
          closeLabel={t('common:close')}
        >
          <EmployeeForm
            pending={create.isPending}
            error={formError}
            onSave={handleCreate}
            onCancel={() => {
              setFormOpen(false)
              setFormError(undefined)
            }}
            submitLabel={t('employees:create')}
          />
        </ModalContent>
      </Modal>
    </div>
  )
}

function EmployeeMobileRow({
  employee,
  language,
}: {
  employee: Employee
  language: 'en' | 'ne'
}) {
  const { t } = useTranslation('employees')

  return (
    <li>
      <Link
        to={employeeDetail(employee.id)}
        className="flex items-start gap-3 p-4 transition-colors hover:bg-card-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <EmployeeAvatar employee={employee} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-ui text-sm font-semibold text-charcoal">
                {employee.name}
              </p>
              <p className="mt-0.5 truncate font-ui text-xs text-charcoal-400">
                {employee.phone || t('noDetails')}
              </p>
            </div>
            <StatusBadge active={employee.is_active} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-charcoal-500">
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {employee.role_title || t('noRole')}
            </span>
            {employee.joined_date_bs ? (
              <span className="whitespace-nowrap">{employee.joined_date_bs}</span>
            ) : null}
            <span className="font-semibold text-charcoal [overflow-wrap:anywhere]">
              {employee.monthly_salary === null
                ? t('salaryNotSet')
                : formatMoney(employee.monthly_salary, language)}
            </span>
          </div>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="mt-2 size-4 shrink-0 text-charcoal-400"
        />
      </Link>
    </li>
  )
}

function EmployeeRow({ employee, language }: { employee: Employee; language: 'en' | 'ne' }) {
  const { t } = useTranslation('employees')
  const navigate = useNavigate()

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>): void {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(employeeDetail(employee.id))
  }

  return (
    <tr
      onClick={handleRowClick}
      className="group cursor-pointer transition-colors hover:bg-card-alt"
    >
      <td className="px-5 py-3">
        <Link
          to={employeeDetail(employee.id)}
          className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <EmployeeAvatar employee={employee} />
          <span className="min-w-0">
            <span className="block truncate font-ui text-sm font-semibold text-charcoal">
              {employee.name}
            </span>
            <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
              {employee.phone || t('noDetails')}
            </span>
          </span>
        </Link>
      </td>
      <td className="hidden px-5 py-3 font-ui text-sm text-charcoal-500 md:table-cell">
        {employee.role_title || t('noRole')}
      </td>
      <td className="hidden px-5 py-3 font-ui text-sm text-charcoal-500 lg:table-cell">
        {employee.joined_date_bs || '—'}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-right font-ui text-sm font-semibold text-charcoal">
        {employee.monthly_salary === null
          ? t('salaryNotSet')
          : formatMoney(employee.monthly_salary, language)}
      </td>
      <td className="px-5 py-3">
        <StatusBadge active={employee.is_active} />
      </td>
      <td className="px-2 py-3 text-right">
        <Link
          to={employeeDetail(employee.id)}
          aria-label={t('view', { name: employee.name })}
          className="inline-grid size-9 place-items-center rounded-sm text-charcoal-400 transition-all group-hover:translate-x-0.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </td>
    </tr>
  )
}

function EmployeeAvatar({ employee }: { employee: Employee }) {
  const initials = employee.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-pill bg-wood-100 font-ui text-sm font-bold text-primary"
    >
      {initials || '?'}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation('employees')
  return (
    <span
      className={cn(
        'rounded-pill px-2 py-0.5 font-ui text-[10px] font-semibold',
        active ? 'bg-pine-100 text-pine-700' : 'bg-charcoal-100 text-charcoal-500',
      )}
    >
      {active ? t('status.active') : t('status.inactive')}
    </span>
  )
}
