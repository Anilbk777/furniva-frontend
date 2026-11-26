import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Ban,
  ChevronRight,
  ClipboardList,
  Hammer,
  Loader2,
  PackageCheck,
  PackagePlus,
  Truck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { BsDatePicker } from 'src/components/ui/BsDatePicker'
import { Button } from 'src/components/ui/Button'
import { Card } from 'src/components/ui/Card'
import { FormField } from 'src/components/ui/FormField'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { SearchInput } from 'src/components/ui/SearchInput'
import { Select } from 'src/components/ui/Select'
import { Skeleton } from 'src/components/ui/Skeleton'
import { StatCard } from 'src/components/ui/StatCard'
import { mapApiError } from 'src/features/auth'
import { useCustomer } from 'src/features/customers'
import {
  OrderCoverPhoto,
  OrderPriorityBadge,
  OrderStatusBadge,
} from 'src/features/orders/components/OrderBits'
import { OrderForm } from 'src/features/orders/components/OrderForm'
import { useOrders } from 'src/features/orders/hooks/useOrders'
import { useOrdersOverview } from 'src/features/orders/hooks/useOrdersOverview'
import { useCreateOrder } from 'src/features/orders/hooks/useOrderMutations'
import {
  handoverTypes,
  orderPriorities,
  orderStatuses,
  type HandoverType,
  type OrderInput,
  type OrderListItem,
  type OrderPriority,
  type OrderStatus,
} from 'src/features/orders/types'
import { parseBsDate } from 'src/lib/bsCalendar'
import { cn } from 'src/lib/cn'
import { formatDateTime, formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { orderDetail } from 'src/lib/paths'
import { formatApiTimeDisplay } from 'src/lib/time'

const PAGE_SIZE = 10

const statusIcons = {
  new: PackagePlus,
  in_progress: Hammer,
  ready: PackageCheck,
  delivered: Truck,
  cancelled: Ban,
} as const

export function OrdersPage() {
  const { t, i18n } = useTranslation(['orders', 'customers', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [searchParams, setSearchParams] = useSearchParams()
  const customerId = searchParams.get('customer_id') ?? ''

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [priority, setPriority] = useState<OrderPriority | ''>('')
  const [handover, setHandover] = useState<HandoverType | ''>('')
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()

  const create = useCreateOrder()
  const overview = useOrdersOverview()
  const customerFilter = useCustomer(customerId || undefined)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fromValue = parseBsDate(fromInput) ? fromInput.trim() : undefined
  const toValue = parseBsDate(toInput) ? toInput.trim() : undefined
  const rangeInvalid = Boolean(fromValue && toValue && fromValue > toValue)
  const deliveryFrom = rangeInvalid ? undefined : fromValue
  const deliveryTo = rangeInvalid ? undefined : toValue

  const orders = useOrders({
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    handover_type: handover || undefined,
    customer_id: customerId || undefined,
    delivery_from: deliveryFrom,
    delivery_to: deliveryTo,
    page,
    limit: PAGE_SIZE,
  })

  function resetPage(): void {
    setPage(1)
  }

  function clearFilters(): void {
    setSearch('')
    setDebouncedSearch('')
    setStatus('')
    setPriority('')
    setHandover('')
    setFromInput('')
    setToInput('')
    setPage(1)
  }

  function clearCustomerFilter(): void {
    const next = new URLSearchParams(searchParams)
    next.delete('customer_id')
    setSearchParams(next)
    setPage(1)
  }

  function handleCreate(input: OrderInput): void {
    setFormError(undefined)
    create.mutate(input, {
      onSuccess() {
        setFormOpen(false)
        clearFilters()
      },
      onError(error: unknown) {
        setFormError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  const result = orders.data
  const rows = result?.orders ?? []
  const totalPages = result?.pagination.total_pages ?? 1
  const stats = overview.data
  const statsLoading = overview.isLoading
  const statValue = (value: number | undefined): number | string =>
    overview.isError ? '—' : (value ?? 0)
  const filtered =
    Boolean(debouncedSearch) ||
    status !== '' ||
    priority !== '' ||
    handover !== '' ||
    Boolean(customerId) ||
    Boolean(deliveryFrom) ||
    Boolean(deliveryTo)
  const filtersActive =
    Boolean(debouncedSearch) ||
    status !== '' ||
    priority !== '' ||
    handover !== '' ||
    Boolean(fromInput) ||
    Boolean(toInput)

  const statusFilters: Array<{ key: OrderStatus; value?: number }> = [
    { key: 'new', value: stats?.new },
    { key: 'in_progress', value: stats?.in_progress },
    { key: 'ready', value: stats?.ready },
    { key: 'delivered', value: stats?.delivered },
    { key: 'cancelled', value: stats?.cancelled },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold text-charcoal sm:text-2xl">
            {t("orders:title")}
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            {t("orders:subtitle")}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <PackagePlus aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{t("orders:add")}</span>
        </Button>
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        aria-busy={statsLoading || undefined}
      >
        <StatCard
          label={t("orders:overview.total")}
          value={statValue(stats?.total)}
          loading={statsLoading}
          icon={<ClipboardList aria-hidden="true" className="size-4" />}
          active={status === ""}
          onClick={() => {
            setStatus("");
            resetPage();
          }}
        />
        {statusFilters.map(({ key, value }) => {
          const Icon = statusIcons[key];
          return (
            <StatCard
              key={key}
              label={translate(t, `orders.overview.${key}`)}
              value={statValue(value)}
              loading={statsLoading}
              icon={<Icon aria-hidden="true" className="size-4" />}
              active={status === key}
              onClick={() => {
                setStatus((current) => (current === key ? "" : key));
                resetPage();
              }}
            />
          );
        })}
      </div>

      {customerId ? (
        <div className="flex flex-col gap-2 rounded-sm border border-line bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 font-ui text-sm text-charcoal wrap-anywhere">
            {t("orders:customerFilter", {
              name: customerFilter.data?.name ?? "…",
            })}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={clearCustomerFilter}
          >
            {t("orders:clearCustomerFilter")}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-3 sm:max-w-md">
            <SearchInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder={t("orders:searchPlaceholder")}
              aria-label={t("common:search")}
            />
            {orders.isFetching && !orders.isLoading ? (
              <Loader2
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin text-charcoal-400"
              />
            ) : null}
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
            <Select
              aria-label={t("orders:filterStatus")}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as OrderStatus | "");
                resetPage();
              }}
            >
              <option value="">{t("orders:allStatuses")}</option>
              {orderStatuses.map((value) => (
                <option key={value} value={value}>
                  {translate(t, `orders.statuses.${value}`)}
                </option>
              ))}
            </Select>
            <Select
              aria-label={t("orders:filterPriority")}
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value as OrderPriority | "");
                resetPage();
              }}
            >
              <option value="">{t("orders:allPriorities")}</option>
              {orderPriorities.map((value) => (
                <option key={value} value={value}>
                  {translate(t, `orders.priorities.${value}`)}
                </option>
              ))}
            </Select>
            <Select
              aria-label={t("orders:filterHandover")}
              value={handover}
              onChange={(event) => {
                setHandover(event.target.value as HandoverType | "");
                resetPage();
              }}
            >
              <option value="">{t("orders:allHandover")}</option>
              {handoverTypes.map((value) => (
                <option key={value} value={value}>
                  {translate(t, `orders.handovers.${value}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-sm bg-canvas-alt p-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <FormField
              id="orders-delivery-from"
              label={t("orders:deliveryFrom")}
              error={rangeInvalid ? t("orders:rangeInvalid") : undefined}
            >
              {(describedBy) => (
                <BsDatePicker
                  id="orders-delivery-from"
                  value={fromInput}
                  onChange={setFromInput}
                  language={language}
                  openLabel={t("common:pickDate")}
                  placeholder="2083-08-01"
                  invalid={rangeInvalid}
                  describedBy={describedBy}
                />
              )}
            </FormField>
            <FormField id="orders-delivery-to" label={t("orders:deliveryTo")}>
              {(describedBy) => (
                <BsDatePicker
                  id="orders-delivery-to"
                  value={toInput}
                  onChange={setToInput}
                  language={language}
                  openLabel={t("common:pickDate")}
                  placeholder="2083-08-30"
                  invalid={rangeInvalid}
                  describedBy={describedBy}
                />
              )}
            </FormField>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
              <Button
                size="sm"
                variant="secondary"
                onClick={clearFilters}
                disabled={!filtersActive}
              >
                {t("orders:resetFilters")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {orders.isError ? (
        <Alert variant="error">{t("orders:loadError")}</Alert>
      ) : null}

      {orders.isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-10 shrink-0 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden h-4 w-24 md:block" />
                <Skeleton className="h-5 w-16 rounded-pill" />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!orders.isLoading && !orders.isError && rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-pill bg-wood-100 text-primary">
            <ClipboardList aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              {filtered
                ? t("orders:emptyFilteredTitle")
                : t("orders:emptyTitle")}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {filtered ? t("orders:emptyFilteredBody") : t("orders:emptyBody")}
            </p>
          </div>
          {!filtered ? (
            <Button onClick={() => setFormOpen(true)}>
              <PackagePlus aria-hidden="true" className="size-4" />
              {t("orders:add")}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <Card
          className={cn(
            "overflow-hidden transition-opacity",
            orders.isFetching ? "opacity-60" : "",
          )}
        >
          <ul className="divide-y divide-line md:hidden">
            {rows.map((order) => (
              <OrderMobileRow
                key={order.id}
                order={order}
                language={language}
              />
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left md:min-w-150">
              <thead className="bg-canvas-alt">
                <tr className="font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("orders:columns.order")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("orders:columns.customer")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3 font-semibold lg:table-cell"
                  >
                    {t("orders:columns.delivery")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3 font-semibold xl:table-cell"
                  >
                    {t("orders:columns.created")}
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right font-semibold"
                  >
                    {t("orders:columns.amount")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("orders:columns.status")}
                  </th>
                  <th scope="col" className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((order) => (
                  <OrderRow key={order.id} order={order} language={language} />
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
            {t("orders:previous")}
          </Button>
          <span className="order-first w-full text-center font-ui text-sm text-charcoal-500 sm:order-0 sm:w-auto">
            {t("orders:pageOf", { page, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            className="flex-1 sm:flex-none"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            {t("orders:next")}
          </Button>
        </div>
      ) : null}

      <Modal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setFormError(undefined);
        }}
      >
        <ModalContent
          title={t("orders:addTitle")}
          description={t("orders:addSubtitle")}
          closeLabel={t("common:close")}
        >
          <OrderForm
            defaultCustomerId={customerId || undefined}
            pending={create.isPending}
            error={formError}
            onSave={handleCreate}
            onCancel={() => {
              setFormOpen(false);
              setFormError(undefined);
            }}
            submitLabel={t("orders:create")}
          />
        </ModalContent>
      </Modal>
    </div>
  );
}

function deliveryLabel(order: OrderListItem, language: 'en' | 'ne'): string {
  if (!order.delivery_time) return order.delivery_bs_date
  return `${order.delivery_bs_date} · ${formatApiTimeDisplay(order.delivery_time, language)}`
}

function OrderMobileRow({
  order,
  language,
}: {
  order: OrderListItem
  language: 'en' | 'ne'
}) {
  const { t } = useTranslation('orders')

  return (
    <li>
      <Link
        to={orderDetail(order.id)}
        className="flex items-start gap-3 p-4 transition-colors hover:bg-card-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <OrderCoverPhoto
          src={order.cover_photo}
          alt={t('photoAlt', { number: order.order_number })}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-ui text-xs font-semibold text-charcoal-400">
                {t('orderNumber', { number: order.order_number })}
              </p>
              <p className="mt-0.5 truncate font-ui text-sm font-semibold text-charcoal">
                {order.title}
              </p>
              <p className="mt-0.5 truncate font-ui text-xs text-charcoal-400">
                {order.customer_name}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-charcoal-500">
            <OrderPriorityBadge priority={order.priority} />
            <span>{deliveryLabel(order, language)}</span>
            {order.created_at ? (
              <span>
                {t('columns.created')}: {formatDateTime(order.created_at, language)}
              </span>
            ) : null}
            <span className="font-semibold text-charcoal">
              {formatMoney(order.total_amount, language)}
            </span>
          </div>
        </div>
        <ChevronRight aria-hidden="true" className="mt-2 size-4 shrink-0 text-charcoal-400" />
      </Link>
    </li>
  )
}

function OrderRow({ order, language }: { order: OrderListItem; language: 'en' | 'ne' }) {
  const { t } = useTranslation('orders')
  const navigate = useNavigate()
  const remaining = Number(order.remaining_amount)

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>): void {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(orderDetail(order.id))
  }

  return (
    <tr
      onClick={handleRowClick}
      className="group cursor-pointer transition-colors hover:bg-card-alt"
    >
      <td className="px-5 py-3">
        <Link
          to={orderDetail(order.id)}
          className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <OrderCoverPhoto
            src={order.cover_photo}
            alt={t('photoAlt', { number: order.order_number })}
          />
          <span className="min-w-0">
            <span className="block truncate font-ui text-xs font-semibold text-charcoal-400">
              {t('orderNumber', { number: order.order_number })}
            </span>
            <span className="mt-0.5 block truncate font-ui text-sm font-semibold text-charcoal">
              {order.title}
            </span>
            <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
              {translate(t, `orders.handovers.${order.handover_type}`)} ·{' '}
              {translate(t, `orders.priorities.${order.priority}`)}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-5 py-3">
        <span className="block truncate font-ui text-sm text-charcoal">
          {order.customer_name}
        </span>
        <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
          {order.customer_mobile}
        </span>
      </td>
      <td className="hidden px-5 py-3 font-ui text-sm text-charcoal-500 lg:table-cell">
        {deliveryLabel(order, language)}
      </td>
      <td className="hidden whitespace-nowrap px-5 py-3 font-ui text-sm text-charcoal-500 xl:table-cell">
        {formatDateTime(order.created_at, language)}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-right">
        <span className="block font-ui text-sm font-semibold text-charcoal">
          {formatMoney(order.total_amount, language)}
        </span>
        {remaining > 0 ? (
          <span className="mt-0.5 block font-ui text-xs text-charcoal-400">
            {t('remainingAmount')}: {formatMoney(order.remaining_amount, language)}
          </span>
        ) : null}
      </td>
      <td className="px-5 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-2 py-3 text-right">
        <Link
          to={orderDetail(order.id)}
          aria-label={t('view', { number: order.order_number })}
          className="inline-grid size-9 place-items-center rounded-sm text-charcoal-400 transition-all group-hover:translate-x-0.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </td>
    </tr>
  )
}
