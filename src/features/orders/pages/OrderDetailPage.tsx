import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Ban,
  ChevronLeft,
  CircleCheck,
  Hammer,
  Pencil,
  Trash2,
  Truck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from 'src/components/ui/Card'
import { ConfirmDialog } from 'src/components/ui/ConfirmDialog'
import {
  DetailPageSkeleton,
  SkeletonFields,
} from 'src/components/ui/DetailPageSkeleton'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { ProgressBar } from 'src/components/ui/ProgressBar'
import { Skeleton } from 'src/components/ui/Skeleton'
import { mapApiError } from 'src/features/auth'
import {
  OrderHandoverBadge,
  OrderPriorityBadge,
  OrderStatusBadge,
} from 'src/features/orders/components/OrderBits'
import { OrderForm } from 'src/features/orders/components/OrderForm'
import { useOrder } from 'src/features/orders/hooks/useOrder'
import {
  useChangeOrderStatus,
  useDeleteOrder,
  useUpdateOrder,
} from 'src/features/orders/hooks/useOrderMutations'
import {
  deletableStatuses,
  lockedStatuses,
  statusTransitions,
  type OrderInput,
  type OrderStatus,
} from 'src/features/orders/types'
import { formatDateTime, formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { customerDetail, paths } from 'src/lib/paths'
import { formatApiTimeDisplay } from 'src/lib/time'

const transitionIcons = {
  in_progress: Hammer,
  ready: CircleCheck,
  delivered: Truck,
  cancelled: Ban,
} as const

export function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['orders', 'customers', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [editing, setEditing] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [actionError, setActionError] = useState<string | undefined>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const order = useOrder(orderId)
  const update = useUpdateOrder(orderId ?? '')
  const changeStatus = useChangeOrderStatus(orderId ?? '')
  const remove = useDeleteOrder(orderId ?? '')

  function handleSave(input: OrderInput): void {
    setFormError(undefined)
    update.mutate(input, {
      onSuccess() {
        setEditing(false)
      },
      onError(error: unknown) {
        setFormError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  function moveTo(status: OrderStatus): void {
    setActionError(undefined)
    changeStatus.mutate(status, {
      onSuccess() {
        setConfirmCancel(false)
      },
      onError(error: unknown) {
        setConfirmCancel(false)
        setActionError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  if (order.isLoading) {
    return (
      <DetailPageSkeleton actions={2} avatar={false}>
        <Card>
          <div className="flex flex-col gap-2 p-5">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-11 rounded-sm sm:w-40" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="min-w-0 lg:col-span-1">
            <CardContent className="flex flex-col gap-4 p-5">
              <Skeleton className="h-6 w-24" />
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-baseline justify-between gap-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
              <Skeleton className="h-2.5 w-full rounded-pill" />
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:col-span-2">
            <CardContent className="flex flex-col gap-4 p-5">
              <Skeleton className="h-6 w-28" />
              <SkeletonFields count={6} />
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:col-span-2">
            <CardContent className="flex flex-col gap-4 p-5">
              <Skeleton className="h-6 w-36" />
              <SkeletonFields count={5} />
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:col-span-1">
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="h-6 w-24" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DetailPageSkeleton>
    )
  }

  if (order.isError || !order.data) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error">{t('orders:loadError')}</Alert>
        <Link
          to={paths.orders}
          className="self-start font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('orders:backToList')}
        </Link>
      </div>
    )
  }

  const record = order.data
  const status = record.status as OrderStatus
  const locked = lockedStatuses.includes(status)
  const deletable = deletableStatuses.includes(status)
  const transitions = statusTransitions[status] ?? []
  const advancePercent =
    Number(record.total_amount) > 0
      ? (Number(record.advance_amount) / Number(record.total_amount)) * 100
      : 0

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={paths.orders}
        className="inline-flex items-center gap-1 self-start font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t("orders:backToList")}
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
            {t("orders:orderNumber", { number: record.order_number })}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 font-heading text-xl font-bold text-charcoal wrap-anywhere sm:text-2xl">
              {record.title}
            </h2>
            <OrderStatusBadge status={record.status} />
            <OrderPriorityBadge priority={record.priority} />
          </div>
          <p className="mt-1 truncate text-sm text-charcoal-500">
            {record.customer_name} · {record.customer_mobile}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setEditing(true)}
            disabled={locked}
          >
            <Pencil aria-hidden="true" className="size-4 shrink-0" />
            {t("common:edit")}
          </Button>
          {deletable ? (
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{t("common:delete")}</span>
            </Button>
          ) : null}
        </div>
      </div>

      {locked ? <Alert variant="info">{t("orders:locked")}</Alert> : null}
      {actionError ? <Alert variant="error">{actionError}</Alert> : null}

      {transitions.length > 0 ? (
        <Card>
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>{t("orders:timeline")}</CardTitle>
              <CardDescription>{t("orders:statusHint")}</CardDescription>
            </div>
          </div>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {transitions.map((next) => {
                const Icon =
                  transitionIcons[next as Exclude<OrderStatus, "new">];
                return (
                  <Button
                    key={next}
                    variant={next === "cancelled" ? "outlined" : "secondary"}
                    disabled={changeStatus.isPending}
                    onClick={() => {
                      if (next === "cancelled") {
                        setConfirmCancel(true);
                        return;
                      }
                      moveTo(next);
                    }}
                    className={
                      next === "cancelled" ? "text-danger-700" : undefined
                    }
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="truncate">
                      {translate(t, `orders.transition.${next}`)}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-1">
          <CardContent className="flex flex-col gap-4 p-5">
            <CardTitle>{t("orders:money")}</CardTitle>
            <dl className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-charcoal-500">
                  {t("orders:totalAmount")}
                </dt>
                <dd className="font-ui text-base font-semibold text-charcoal">
                  {formatMoney(record.total_amount, language)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-charcoal-500">
                  {t("orders:advanceAmount")}
                </dt>
                <dd className="font-ui text-base font-semibold text-pine-700">
                  {formatMoney(record.advance_amount, language)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-charcoal-500">
                  {t("orders:remainingAmount")}
                </dt>
                <dd className="font-ui text-base font-semibold text-primary">
                  {formatMoney(record.remaining_amount, language)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-1.5">
              <ProgressBar
                value={advancePercent}
                label={t("orders:advanceProgress", {
                  percent: Math.round(advancePercent),
                })}
                variant="tertiary"
              />
              <span className="font-ui text-xs text-charcoal-500">
                {t("orders:advanceProgress", {
                  percent: Math.round(advancePercent),
                })}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <span className="text-sm text-charcoal-500">
                {t("orders:paymentMethod")}
              </span>
              <span className="font-ui text-sm font-semibold text-charcoal">
                {record.payment_method
                  ? translate(
                      t,
                      `orders.paymentMethods.${record.payment_method}`,
                    )
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardContent className="flex flex-col gap-4 p-5">
            <CardTitle>{t("orders:details")}</CardTitle>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:category")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {record.category}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:hardwoodSpecies")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {record.hardwood_species || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:handoverType")}
                </dt>
                <dd className="mt-1">
                  <OrderHandoverBadge handover={record.handover_type} />
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:createdAt")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {formatDateTime(record.created_at, language)}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:deliveryDate")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {record.delivery_bs_date}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:deliveryTime")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {formatApiTimeDisplay(record.delivery_time, language)}
                </dd>
              </div>
              {record.delivery_address ? (
                <div className="sm:col-span-2">
                  <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                    {t("orders:deliveryAddress")}
                  </dt>
                  <dd className="mt-1 text-sm text-charcoal wrap-anywhere">
                    {record.delivery_address}
                  </dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:description")}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-charcoal wrap-anywhere">
                  {record.description || t("orders:descriptionEmpty")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <CardTitle>{t("orders:customerInfo")}</CardTitle>
              {record.customer_id ? (
                <Link
                  to={customerDetail(record.customer_id)}
                  className="inline-flex min-h-11 items-center font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t("orders:openCustomer")}
                </Link>
              ) : (
                <span className="font-ui text-xs text-charcoal-500">
                  {t("orders:walkInCustomer")}
                </span>
              )}
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:customerName")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal wrap-anywhere">
                  {record.customer_name}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:customerType")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {translate(t, `customers.types.${record.customer_type}`)}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:customerMobile")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {record.customer_mobile}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:customerCityArea")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal">
                  {record.customer_city_area || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                  {t("orders:customerLandmark")}
                </dt>
                <dd className="mt-1 text-sm text-charcoal wrap-anywhere">
                  {record.customer_landmark || "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-1">
          <CardContent className="flex flex-col gap-3 p-5">
            <CardTitle>{t("orders:photos")}</CardTitle>
            {record.photos.length === 0 ? (
              <p className="text-sm text-charcoal-500">
                {t("orders:noPhotos")}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-2">
                {record.photos.map((photo, index) => (
                  <li key={`${photo}-${index}`}>
                    {/^https?:\/\//.test(photo) ? (
                      <a
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-sm border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <img
                          src={photo}
                          alt={t("orders:photoAlt", { number: index + 1 })}
                          loading="lazy"
                          className="aspect-square w-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="block truncate rounded-sm border border-line bg-card-alt px-2 py-3 font-ui text-xs text-charcoal-500">
                        {photo}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={editing}
        onOpenChange={(open) => {
          setEditing(open);
          if (!open) setFormError(undefined);
        }}
      >
        <ModalContent
          title={t("orders:editTitle")}
          description={t("orders:editSubtitle")}
          closeLabel={t("common:close")}
        >
          <OrderForm
            order={record}
            pending={update.isPending}
            error={formError}
            submitLabel={t("common:save")}
            onSave={handleSave}
            onCancel={() => {
              setEditing(false);
              setFormError(undefined);
            }}
          />
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t("orders:cancelConfirmTitle", { number: record.order_number })}
        description={t("orders:cancelConfirmBody")}
        confirmLabel={t("orders:transition.cancelled")}
        cancelLabel={t("common:back")}
        pending={changeStatus.isPending}
        onConfirm={() => moveTo("cancelled")}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("orders:deleteTitle", { number: record.order_number })}
        description={t("orders:deleteBody")}
        confirmLabel={t("common:confirm")}
        cancelLabel={t("common:cancel")}
        pending={remove.isPending}
        onConfirm={() => {
          remove.mutate(undefined, {
            onSuccess() {
              setConfirmDelete(false);
              navigate(paths.orders, { replace: true });
            },
            onError(error: unknown) {
              setConfirmDelete(false);
              setActionError(translate(t, mapApiError(error).messageKey));
            },
          });
        }}
      />
    </div>
  );
}
