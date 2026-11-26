import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ClipboardList, Pencil, UserCheck, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { Card, CardContent, CardTitle } from 'src/components/ui/Card'
import { ConfirmDialog } from 'src/components/ui/ConfirmDialog'
import {
  DetailPageSkeleton,
  SkeletonFields,
} from 'src/components/ui/DetailPageSkeleton'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { Skeleton } from 'src/components/ui/Skeleton'
import {
  CustomerAvatar,
  CustomerStatusBadge,
  CustomerTypeBadge,
} from 'src/features/customers/components/CustomerBits'
import { CustomerForm } from 'src/features/customers/components/CustomerForm'
import { useCustomer } from 'src/features/customers/hooks/useCustomer'
import {
  useDeleteCustomer,
  useUpdateCustomer,
} from 'src/features/customers/hooks/useCustomerMutations'
import type { CustomerInput } from 'src/features/customers/types'
import { mapApiError } from 'src/features/auth'
import { formatDate, formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { paths } from 'src/lib/paths'

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['customers', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [editing, setEditing] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [actionError, setActionError] = useState<string | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const customer = useCustomer(customerId)
  const update = useUpdateCustomer(customerId ?? '')
  const remove = useDeleteCustomer(customerId ?? '')

  function handleSave(input: CustomerInput): void {
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

  function toggleActive(active: boolean): void {
    setActionError(undefined)
    update.mutate(
      { is_active: active },
      {
        onError(error: unknown) {
          setActionError(translate(t, mapApiError(error).messageKey))
        },
      },
    )
  }

  if (customer.isLoading) {
    return (
      <DetailPageSkeleton actions={3}>
        <Card className="min-w-0">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-11 w-full rounded-sm sm:w-40" />
          </div>
          <CardContent>
            <SkeletonFields count={5} />
          </CardContent>
        </Card>
      </DetailPageSkeleton>
    )
  }

  if (customer.isError || !customer.data) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error">{t('customers:loadError')}</Alert>
        <Link
          to={paths.customers}
          className="self-start font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('customers:backToList')}
        </Link>
      </div>
    )
  }

  const record = customer.data

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={paths.customers}
        className="inline-flex items-center gap-1 self-start font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t('customers:backToList')}
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <CustomerAvatar name={record.name} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 font-heading text-xl font-bold text-charcoal [overflow-wrap:anywhere] sm:text-2xl">
                {record.name}
              </h2>
              <CustomerTypeBadge type={record.customer_type} />
              <CustomerStatusBadge active={record.is_active} />
            </div>
            <p className="mt-1 truncate text-sm text-charcoal-500">
              {record.mobile}
              {record.city_area ? ` · ${record.city_area}` : ''}
            </p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:flex-wrap">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" className="size-4 shrink-0" />
            {t('common:edit')}
          </Button>
          <Button
            variant="outlined"
            loading={update.isPending}
            onClick={() => toggleActive(!record.is_active)}
          >
            {record.is_active ? (
              <UserX aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <UserCheck aria-hidden="true" className="size-4 shrink-0" />
            )}
            <span className="truncate">
              {record.is_active ? t('customers:markInactive') : t('customers:markActive')}
            </span>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            {t('common:delete')}
          </Button>
        </div>
      </div>

      {actionError ? <Alert variant="error">{actionError}</Alert> : null}

      <Card className="min-w-0">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle>{t('customers:details')}</CardTitle>
          <Button
            variant="secondary"
            onClick={() => navigate(`${paths.orders}?customer_id=${record.id}`)}
            className="w-full sm:w-auto"
          >
            <ClipboardList aria-hidden="true" className="size-4" />
            {t('customers:viewOrders')}
          </Button>
        </div>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                {t('customers:contact')}
              </dt>
              <dd className="mt-1 space-y-0.5 text-sm text-charcoal">
                <p>{record.mobile}</p>
                {record.alt_phone ? (
                  <p className="text-charcoal-500">{record.alt_phone}</p>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                {t('customers:address')}
              </dt>
              <dd className="mt-1 space-y-0.5 text-sm text-charcoal">
                <p>{record.city_area}</p>
                {record.landmark ? (
                  <p className="text-charcoal-500">{record.landmark}</p>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                {t('customers:balance')}
              </dt>
              <dd className="mt-1 font-ui text-sm font-semibold text-charcoal">
                {formatMoney(record.opening_balance, language)}
              </dd>
            </div>
            <div>
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                {t('customers:customerSince')}
              </dt>
              <dd className="mt-1 text-sm text-charcoal">
                {formatDate(record.created_at, language)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
                {t('customers:note')}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-charcoal [overflow-wrap:anywhere]">
                {record.khata_note || t('customers:noNote')}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Modal
        open={editing}
        onOpenChange={(open) => {
          setEditing(open)
          if (!open) setFormError(undefined)
        }}
      >
        <ModalContent
          title={t('customers:editTitle')}
          description={t('customers:editSubtitle')}
          closeLabel={t('common:close')}
        >
          <CustomerForm
            customer={record}
            pending={update.isPending}
            error={formError}
            submitLabel={t('common:save')}
            onSave={handleSave}
            onCancel={() => {
              setEditing(false)
              setFormError(undefined)
            }}
          />
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('customers:deleteTitle', { name: record.name })}
        description={t('customers:deleteBody')}
        confirmLabel={t('common:confirm')}
        cancelLabel={t('common:cancel')}
        pending={remove.isPending}
        onConfirm={() => {
          remove.mutate(undefined, {
            onSuccess() {
              setConfirmOpen(false)
              navigate(paths.customers, { replace: true })
            },
          })
        }}
      />
    </div>
  )
}
