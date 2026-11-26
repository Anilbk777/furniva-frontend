import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Loader2,
  UserCheck,
  UserPlus,
  UserRoundX,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { Card } from 'src/components/ui/Card'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { SearchInput } from 'src/components/ui/SearchInput'
import { Select } from 'src/components/ui/Select'
import { Skeleton } from 'src/components/ui/Skeleton'
import { StatCard } from 'src/components/ui/StatCard'
import {
  CustomerAvatar,
  CustomerStatusBadge,
  CustomerTypeBadge,
} from 'src/features/customers/components/CustomerBits'
import { CustomerForm } from 'src/features/customers/components/CustomerForm'
import { useCustomers } from 'src/features/customers/hooks/useCustomers'
import { useCustomersOverview } from 'src/features/customers/hooks/useCustomersOverview'
import { useCreateCustomer } from 'src/features/customers/hooks/useCustomerMutations'
import {
  customerTypes,
  type Customer,
  type CustomerInput,
  type CustomerType,
} from 'src/features/customers/types'
import { mapApiError } from 'src/features/auth'
import { customerDetail } from 'src/lib/paths'
import { cn } from 'src/lib/cn'
import { translate } from 'src/lib/i18n'

type StatusFilter = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 10

export function CustomersPage() {
  const { t } = useTranslation(['customers', 'common', 'errors'])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [type, setType] = useState<CustomerType | ''>('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const create = useCreateCustomer()
  const overview = useCustomersOverview()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const customers = useCustomers({
    search: debouncedSearch || undefined,
    customer_type: type || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    page,
    limit: PAGE_SIZE,
  })

  function handleCreate(input: CustomerInput): void {
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

  const result = customers.data
  const rows = result?.customers ?? []
  const totalPages = result?.pagination.total_pages ?? 1
  const stats = overview.data
  const statsLoading = overview.isLoading
  const statValue = (value: number | undefined): number | string =>
    overview.isError ? '—' : (value ?? 0)
  const filtered = Boolean(debouncedSearch) || status !== 'all' || Boolean(type)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold text-charcoal sm:text-2xl">
            {t('customers:title')}
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">{t('customers:subtitle')}</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <UserPlus aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{t('customers:add')}</span>
        </Button>
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        aria-busy={statsLoading || undefined}
      >
        <StatCard
          label={t('customers:overview.total')}
          value={statValue(stats?.total)}
          loading={statsLoading}
          icon={<UsersRound aria-hidden="true" className="size-4" />}
          active={status === 'all'}
          onClick={() => {
            setStatus('all')
            setPage(1)
          }}
        />
        <StatCard
          label={t('customers:overview.active')}
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
          label={t('customers:overview.inactive')}
          value={statValue(stats?.inactive)}
          loading={statsLoading}
          icon={<UserRoundX aria-hidden="true" className="size-4" />}
          active={status === 'inactive'}
          onClick={() => {
            setStatus('inactive')
            setPage(1)
          }}
          className="col-span-2 sm:col-span-1"
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
            placeholder={t('customers:searchPlaceholder')}
            aria-label={t('common:search')}
          />
          {customers.isFetching && !customers.isLoading ? (
            <Loader2
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin text-charcoal-400"
            />
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <Select
            aria-label={t('customers:filterByType')}
            value={type}
            onChange={(event) => {
              setType(event.target.value as CustomerType | '')
              setPage(1)
            }}
            className="min-h-11 w-full sm:w-44"
          >
            <option value="">{t('customers:allTypes')}</option>
            {customerTypes.map((value) => (
              <option key={value} value={value}>
                {translate(t, `customers.types.${value}`)}
              </option>
            ))}
          </Select>
          <div
            role="group"
            aria-label={t('customers:filterLabel')}
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
                {translate(t, `customers.filter.${value}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {customers.isError ? (
        <Alert variant="error">{t('customers:loadError')}</Alert>
      ) : null}

      {customers.isLoading ? (
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

      {!customers.isLoading && !customers.isError && rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-pill bg-wood-100 text-primary">
            <UsersRound aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              {filtered ? t('customers:emptyFilteredTitle') : t('customers:emptyTitle')}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {filtered ? t('customers:emptyFilteredBody') : t('customers:emptyBody')}
            </p>
          </div>
          {!filtered ? (
            <Button onClick={() => setFormOpen(true)}>
              <UserPlus aria-hidden="true" className="size-4" />
              {t('customers:add')}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <Card
          className={cn(
            'overflow-hidden transition-opacity',
            customers.isFetching ? 'opacity-60' : '',
          )}
        >
          <ul className="divide-y divide-line md:hidden">
            {rows.map((customer) => (
              <CustomerMobileRow key={customer.id} customer={customer} />
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left md:min-w-150">
              <thead className="bg-canvas-alt">
                <tr className="font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('customers:columns.customer')}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('customers:columns.type')}
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-semibold lg:table-cell">
                    {t('customers:columns.area')}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('customers:columns.status')}
                  </th>
                  <th scope="col" className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((customer) => (
                  <CustomerRow key={customer.id} customer={customer} />
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
            {t('customers:previous')}
          </Button>
          <span className="order-first w-full text-center font-ui text-sm text-charcoal-500 sm:order-none sm:w-auto">
            {t('customers:pageOf', { page, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            className="flex-1 sm:flex-none"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            {t('customers:next')}
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
          title={t('customers:addTitle')}
          description={t('customers:addSubtitle')}
          closeLabel={t('common:close')}
        >
          <CustomerForm
            pending={create.isPending}
            error={formError}
            onSave={handleCreate}
            onCancel={() => {
              setFormOpen(false)
              setFormError(undefined)
            }}
            submitLabel={t('customers:create')}
          />
        </ModalContent>
      </Modal>
    </div>
  )
}

function CustomerMobileRow({ customer }: { customer: Customer }) {
  const { t } = useTranslation('customers')

  return (
    <li>
      <Link
        to={customerDetail(customer.id)}
        className="flex items-start gap-3 p-4 transition-colors hover:bg-card-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <CustomerAvatar name={customer.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-ui text-sm font-semibold text-charcoal">
                {customer.name}
              </p>
              <p className="mt-0.5 truncate font-ui text-xs text-charcoal-400">
                {customer.mobile || t('noPhone')}
              </p>
            </div>
            <CustomerStatusBadge active={customer.is_active} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-charcoal-500">
            <CustomerTypeBadge type={customer.customer_type} />
            {customer.city_area ? (
              <span className="min-w-0 [overflow-wrap:anywhere]">{customer.city_area}</span>
            ) : null}
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

function CustomerRow({ customer }: { customer: Customer }) {
  const { t } = useTranslation('customers')
  const navigate = useNavigate()

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>): void {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(customerDetail(customer.id))
  }

  return (
    <tr
      onClick={handleRowClick}
      className="group cursor-pointer transition-colors hover:bg-card-alt"
    >
      <td className="px-5 py-3">
        <Link
          to={customerDetail(customer.id)}
          className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CustomerAvatar name={customer.name} />
          <span className="min-w-0">
            <span className="block truncate font-ui text-sm font-semibold text-charcoal">
              {customer.name}
            </span>
            <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
              {customer.mobile || t('noPhone')}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-5 py-3">
        <CustomerTypeBadge type={customer.customer_type} />
      </td>
      <td className="hidden px-5 py-3 font-ui text-sm text-charcoal-500 lg:table-cell">
        {customer.city_area || '—'}
      </td>
      <td className="px-5 py-3">
        <CustomerStatusBadge active={customer.is_active} />
      </td>
      <td className="px-2 py-3 text-right">
        <Link
          to={customerDetail(customer.id)}
          aria-label={t('view', { name: customer.name })}
          className="inline-grid size-9 place-items-center rounded-sm text-charcoal-400 transition-all group-hover:translate-x-0.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </td>
    </tr>
  )
}
