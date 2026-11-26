import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, Pencil, Plus, Trash2, UserCheck, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { BsDatePicker } from 'src/components/ui/BsDatePicker'
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
  SkeletonTableRows,
} from 'src/components/ui/DetailPageSkeleton'
import { FormField } from 'src/components/ui/FormField'
import { IconButton } from 'src/components/ui/IconButton'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { Select } from 'src/components/ui/Select'
import { Skeleton } from 'src/components/ui/Skeleton'
import { PartyAvatar, StatusBadge } from 'src/features/parties/components/PartyBits'
import { PartyForm } from 'src/features/parties/components/PartyForm'
import { PartyTransactionForm } from 'src/features/parties/components/PartyTransactionForm'
import { useParty } from 'src/features/parties/hooks/useParty'
import { useDeleteParty, useUpdateParty } from 'src/features/parties/hooks/usePartyMutations'
import { usePartyTransactions } from 'src/features/parties/hooks/usePartyTransactions'
import {
  useCreatePartyTransaction,
  useDeletePartyTransaction,
  useUpdatePartyTransaction,
} from 'src/features/parties/hooks/usePartyTransactionMutations'
import {
  partyTxKinds,
  type PartyInput,
  type PartyTransactionInput,
  type PartyTxKind,
  type Transaction,
} from 'src/features/parties/types'
import { mapApiError } from 'src/features/auth'
import { bsMonthLength, formatBsDate, todayBs, todayBsString } from 'src/lib/bsCalendar'
import { cn } from 'src/lib/cn'
import { formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { paths } from 'src/lib/paths'

const PAGE_SIZE = 10

// Default range: the current Bikram Sambat month, 1st through today.
const currentMonth = todayBs()
const monthStart = formatBsDate({
  year: currentMonth.year,
  month: currentMonth.month,
  day: 1,
})
const monthEnd = formatBsDate({
  year: currentMonth.year,
  month: currentMonth.month,
  day: bsMonthLength(currentMonth.year, currentMonth.month),
})

export function PartyDetailPage() {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation([
    'parties',
    'partyTransactions',
    'common',
    'errors',
  ])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [editing, setEditing] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [txOpen, setTxOpen] = useState(false)
  const [txEditing, setTxEditing] = useState<Transaction | null>(null)
  const [txDeleting, setTxDeleting] = useState<Transaction | null>(null)
  const [txError, setTxError] = useState<string | undefined>()
  const [txDeleteError, setTxDeleteError] = useState<string | undefined>()
  const [kind, setKind] = useState<PartyTxKind | ''>('')
  const [page, setPage] = useState(1)
  const [fromInput, setFromInput] = useState(monthStart)
  const [toInput, setToInput] = useState(monthEnd)
  const [appliedFrom, setAppliedFrom] = useState(monthStart)
  const [appliedTo, setAppliedTo] = useState(monthEnd)
  const [rangeError, setRangeError] = useState<string | undefined>()

  const party = useParty(partyId)
  const tx = usePartyTransactions({
    partyId: partyId ?? '',
    dateFrom: appliedFrom || undefined,
    dateTo: appliedTo || undefined,
    kind: kind || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const update = useUpdateParty(partyId ?? '')
  const remove = useDeleteParty(partyId ?? '')
  const createTx = useCreatePartyTransaction()
  const updateTx = useUpdatePartyTransaction()
  const deleteTx = useDeletePartyTransaction()
  const defaultDate = todayBsString()

  const totals = tx.data?.totals
  const amounts = totals?.amounts ?? {}
  const count = totals?.count ?? 0
  const rows = tx.data?.transactions ?? []
  const totalPages = tx.data?.pagination.total_pages ?? 1
  const transactionsFetching = tx.isFetching && !tx.isLoading
  const transactionsLoading = tx.isLoading

  function handleSave(input: PartyInput): void {
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

  function openCreateTransaction(): void {
    setTxEditing(null)
    setTxError(undefined)
    setTxOpen(true)
  }

  function openEditTransaction(transaction: Transaction): void {
    setTxEditing(transaction)
    setTxError(undefined)
    setTxOpen(true)
  }

  function closeTransactionModal(): void {
    setTxOpen(false)
    setTxEditing(null)
    setTxError(undefined)
  }

  function handleSaveTransaction(input: PartyTransactionInput): void {
    setTxError(undefined)
    if (txEditing) {
      updateTx.mutate(
        { transactionId: txEditing.id, input },
        {
          onSuccess() {
            closeTransactionModal()
          },
          onError(error: unknown) {
            setTxError(translate(t, mapApiError(error).messageKey))
          },
        },
      )
      return
    }
    createTx.mutate(input, {
      onSuccess() {
        closeTransactionModal()
        setPage(1)
      },
      onError(error: unknown) {
        setTxError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  function handleDeleteTransaction(): void {
    if (!txDeleting) return
    setTxDeleteError(undefined)
    deleteTx.mutate(txDeleting.id, {
      onSuccess() {
        if (rows.length === 1 && page > 1) {
          setPage((value) => Math.max(1, value - 1))
        }
        setTxDeleting(null)
      },
      onError(error: unknown) {
        setTxDeleteError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  function applyRange(): void {
    if (fromInput && toInput && fromInput > toInput) {
      setRangeError(t('partyTransactions:rangeInvalid'))
      return
    }
    setRangeError(undefined)
    setAppliedFrom(fromInput)
    setAppliedTo(toInput)
    setPage(1)
  }

  function resetFilters(): void {
    setKind('')
    setFromInput(monthStart)
    setToInput(monthEnd)
    setAppliedFrom(monthStart)
    setAppliedTo(monthEnd)
    setRangeError(undefined)
    setPage(1)
  }

  if (party.isLoading) {
    return (
      <DetailPageSkeleton actions={3}>
        <Card className="min-w-0">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-sm sm:w-36" />
          </div>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-sm" />
              ))}
            </div>
            <Skeleton className="h-32 rounded-sm" />
            <SkeletonTableRows rows={3} />
          </CardContent>
        </Card>
      </DetailPageSkeleton>
    )
  }

  if (party.isError || !party.data) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error">{t('parties:loadError')}</Alert>
        <Link
          to={paths.parties}
          className="self-start font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('parties:backToList')}
        </Link>
      </div>
    )
  }

  const record = party.data

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={paths.parties}
        className="inline-flex items-center gap-1 self-start font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t('parties:backToList')}
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <PartyAvatar name={record.name} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 font-heading text-xl font-bold text-charcoal [overflow-wrap:anywhere] sm:text-2xl">
                {record.name}
              </h2>
              <StatusBadge active={record.is_active} />
            </div>
            <p className="mt-1 truncate text-sm text-charcoal-500">
              {record.party_type.name}
              {record.phone ? ` · ${record.phone}` : ''}
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
            onClick={() => update.mutate({ is_active: !record.is_active })}
          >
            {record.is_active ? (
              <UserX aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <UserCheck aria-hidden="true" className="size-4 shrink-0" />
            )}
            <span className="truncate">
              {record.is_active ? t('parties:markInactive') : t('parties:markActive')}
            </span>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            {t('common:delete')}
          </Button>
        </div>
      </div>

      

      <Card className="min-w-0">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{t('partyTransactions:sectionTitle')}</CardTitle>
            <CardDescription>{t('partyTransactions:sectionSubtitle')}</CardDescription>
          </div>
          <Button onClick={openCreateTransaction} className="w-full sm:w-auto">
            <Plus aria-hidden="true" className="size-4" />
            {t('partyTransactions:add')}
          </Button>
        </div>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            {partyTxKinds.map((value) => (
              <Stat
                key={value}
                label={translate(t, `parties.kinds.${value}`)}
                value={formatMoney(Number(amounts[value] ?? 0), language)}
                loading={transactionsLoading}
              />
            ))}
          </div>

          <div className="rounded-sm bg-canvas-alt p-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FormField
                id="party-tx-from"
                label={t('partyTransactions:filters.from')}
                error={rangeError}
              >
                {(describedBy) => (
                  <BsDatePicker
                    id="party-tx-from"
                    value={fromInput}
                    onChange={setFromInput}
                    language={language}
                    openLabel={t('common:pickDate')}
                    placeholder="2083-08-01"
                    invalid={Boolean(rangeError)}
                    describedBy={describedBy}
                  />
                )}
              </FormField>
              <FormField id="party-tx-to" label={t('partyTransactions:filters.to')}>
                {(describedBy) => (
                  <BsDatePicker
                    id="party-tx-to"
                    value={toInput}
                    onChange={setToInput}
                    language={language}
                    openLabel={t('common:pickDate')}
                    placeholder="2083-08-29"
                    invalid={Boolean(rangeError)}
                    describedBy={describedBy}
                  />
                )}
              </FormField>
              <FormField id="party-tx-filter-kind" label={t('partyTransactions:filters.kind')}>
                {(describedBy) => (
                  <Select
                    id="party-tx-filter-kind"
                    aria-describedby={describedBy}
                    value={kind}
                    onChange={(event) => {
                      setKind(event.target.value as PartyTxKind | '')
                      setPage(1)
                    }}
                  >
                    <option value="">{t('partyTransactions:filters.allKinds')}</option>
                    {partyTxKinds.map((value) => (
                      <option key={value} value={value}>
                        {translate(t, `parties.kinds.${value}`)}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
                <Button size="sm" onClick={applyRange}>
                  {t('partyTransactions:filters.apply')}
                </Button>
                <Button size="sm" variant="secondary" onClick={resetFilters}>
                  {t('partyTransactions:filters.reset')}
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {transactionsFetching ? (
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin text-charcoal-400"
                />
              ) : null}
              <span className="ml-auto font-ui text-xs text-charcoal-500">
                {totals
                  ? t('partyTransactions:totals.count', { count })
                  : '…'}
              </span>
            </div>
          </div>

          {tx.isError ? (
            <Alert variant="error">{t('partyTransactions:loadError')}</Alert>
          ) : null}

          {transactionsLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <div
              className={cn(
                'overflow-x-auto transition-opacity',
                transactionsFetching ? 'opacity-60' : '',
              )}
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {t('partyTransactions:columns.date')}
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {t('partyTransactions:columns.kind')}
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 font-semibold sm:table-cell"
                    >
                      {t('partyTransactions:columns.paymentMethod')}
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 font-semibold md:table-cell"
                    >
                      {t('partyTransactions:columns.note')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">
                      {t('partyTransactions:columns.amount')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">
                      {t('partyTransactions:columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-8 text-center text-sm text-charcoal-500"
                      >
                        {appliedFrom || appliedTo || kind
                          ? t('partyTransactions:empty')
                          : t('partyTransactions:emptyAll')}
                      </td>
                    </tr>
                  ) : (
                    rows.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        language={language}
                        onEdit={() => openEditTransaction(transaction)}
                        onDelete={() => {
                          setTxDeleteError(undefined)
                          setTxDeleting(transaction)
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                {t('partyTransactions:previous')}
              </Button>
              <span className="font-ui text-sm text-charcoal-500">
                {t('partyTransactions:pageOf', { page, total: totalPages })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                {t('partyTransactions:next')}
              </Button>
            </div>
          ) : null}
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
          title={t('parties:editTitle')}
          description={t('parties:editSubtitle')}
          closeLabel={t('common:close')}
        >
          <PartyForm
            party={record}
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

      <Modal
        open={txOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeTransactionModal()
            return
          }
          setTxOpen(true)
        }}
      >
        <ModalContent
          title={
            txEditing ? t('partyTransactions:editTitle') : t('partyTransactions:addTitle')
          }
          description={
            txEditing
              ? t('partyTransactions:editSubtitle', { name: record.name })
              : t('partyTransactions:addSubtitle', { name: record.name })
          }
          closeLabel={t('common:close')}
        >
          <PartyTransactionForm
            key={txEditing?.id ?? 'new'}
            partyId={record.id}
            defaultDate={defaultDate}
            transaction={txEditing ?? undefined}
            submitLabel={
              txEditing ? t('partyTransactions:update') : t('partyTransactions:create')
            }
            pending={txEditing ? updateTx.isPending : createTx.isPending}
            error={txError}
            onSave={handleSaveTransaction}
            onCancel={closeTransactionModal}
          />
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={Boolean(txDeleting)}
        onOpenChange={(open) => {
          if (!open) {
            setTxDeleting(null)
            setTxDeleteError(undefined)
          }
        }}
        title={t('partyTransactions:deleteTitle', {
          date: txDeleting?.bs_date ?? '',
        })}
        description={t('partyTransactions:deleteBody')}
        confirmLabel={t('common:confirm')}
        cancelLabel={t('common:cancel')}
        pending={deleteTx.isPending}
        onConfirm={handleDeleteTransaction}
      >
        {txDeleteError ? (
          <div className="mt-4">
            <Alert variant="error">{txDeleteError}</Alert>
          </div>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('parties:deleteTitle', { name: record.name })}
        description={t('parties:deleteBody')}
        confirmLabel={t('common:confirm')}
        cancelLabel={t('common:cancel')}
        pending={remove.isPending}
        onConfirm={() => {
          remove.mutate(undefined, {
            onSuccess() {
              setConfirmOpen(false)
              navigate(paths.parties, { replace: true })
            },
          })
        }}
      />
    </div>
  )
}

function TransactionRow({
  transaction,
  language,
  onEdit,
  onDelete,
}: {
  transaction: Transaction
  language: 'en' | 'ne'
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation(['parties', 'partyTransactions', 'common'])
  const payment = transaction.payment_method
    ? translate(t, `parties.paymentMethods.${transaction.payment_method}`)
    : '—'
  return (
    <tr className="transition-colors hover:bg-card-alt">
      <td className="whitespace-nowrap px-3 py-3 font-ui text-sm text-charcoal">
        {transaction.bs_date}
      </td>
      <td className="px-3 py-3">
        <span className="block font-ui text-sm font-semibold text-charcoal">
          {translate(t, `parties.kinds.${transaction.kind}`)}
        </span>
        <span className="mt-0.5 block font-ui text-xs text-charcoal-500 sm:hidden">
          {payment}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </span>
      </td>
      <td className="hidden px-3 py-3 font-ui text-sm text-charcoal-500 sm:table-cell">
        {payment}
      </td>
      <td className="hidden max-w-xs px-3 py-3 font-ui text-sm text-charcoal-500 md:table-cell">
        {transaction.note ? (
          <span className="line-clamp-2">{transaction.note}</span>
        ) : (
          '—'
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-right font-ui text-sm font-semibold text-charcoal">
        {formatMoney(transaction.amount, language)}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex justify-end gap-1">
          <IconButton
            label={t('common:edit')}
            variant="outlined"
            size="sm"
            onClick={onEdit}
          >
            <Pencil aria-hidden="true" className="size-4" />
          </IconButton>
          <IconButton
            label={t('common:delete')}
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </IconButton>
        </div>
      </td>
    </tr>
  )
}

function Stat({
  label,
  value,
  loading = false,
}: {
  label: string
  value: string
  loading?: boolean
}) {
  return (
    <div className="rounded-sm bg-canvas-alt p-3">
      <span className="block text-xs text-charcoal-500">{label}</span>
      {loading ? (
        <Skeleton className="mt-1.5 h-5 w-24" />
      ) : (
        <span className="mt-1 block font-heading text-lg font-bold text-charcoal">
          {value}
        </span>
      )}
    </div>
  )
}


