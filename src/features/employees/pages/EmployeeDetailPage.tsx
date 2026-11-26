import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CalendarCheck,
  ChevronLeft,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { BsDatePicker } from 'src/components/ui/BsDatePicker'
import { Button } from 'src/components/ui/Button'
import { buttonVariants } from 'src/components/ui/buttonVariants'
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
import { EmployeeForm } from 'src/features/employees/components/EmployeeForm'
import { TransactionForm } from 'src/features/employees/components/TransactionForm'
import { useCreateTransaction } from 'src/features/employees/hooks/useCreateTransaction'
import { useEmployee } from 'src/features/employees/hooks/useEmployee'
import { useEmployeeTransactions } from 'src/features/employees/hooks/useEmployeeTransactions'
import {
  useDeleteEmployee,
  useUpdateEmployee,
} from 'src/features/employees/hooks/useEmployeeMutations'
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from 'src/features/employees/hooks/useTransactionMutations'
import {
  employeeTxKinds,
  type EmployeeInput,
  type EmployeeTxKind,
  type Transaction,
  type TransactionInput,
} from 'src/features/employees/types'
import { mapApiError } from 'src/features/auth'
import { todayBsString } from 'src/lib/bsCalendar'
import { cn } from 'src/lib/cn'
import { formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { paths, attendanceDetail } from 'src/lib/paths'

const PAGE_SIZE = 20

export function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['employees', 'transactions', 'attendance', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [editing, setEditing] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [txOpen, setTxOpen] = useState(false)
  const [txEditing, setTxEditing] = useState<Transaction | null>(null)
  const [txDeleting, setTxDeleting] = useState<Transaction | null>(null)
  const [txError, setTxError] = useState<string | undefined>()
  const [txDeleteError, setTxDeleteError] = useState<string | undefined>()
  const [kind, setKind] = useState<EmployeeTxKind | ''>('')
  const [page, setPage] = useState(1)
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [rangeError, setRangeError] = useState<string | undefined>()

  // The employee header comes from the transaction response, so opening this
  // screen only needs one request: GET /transactions?employee_id=…
  const tx = useEmployeeTransactions({
    employeeId: employeeId ?? '',
    dateFrom: appliedFrom || undefined,
    dateTo: appliedTo || undefined,
    kind: kind || undefined,
    page,
    limit: PAGE_SIZE,
  })

  // Only fetched when the edit modal opens (it needs the extra fields that the
  // compact EmployeeBrief does not carry).
  const editEmployee = useEmployee(employeeId, { enabled: editing })
  const update = useUpdateEmployee(employeeId ?? '')
  const remove = useDeleteEmployee(employeeId ?? '')
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()
  const defaultDate = todayBsString()

  const brief = tx.data?.employee ?? null
  const totals = tx.data?.totals
  const amounts = totals?.amounts ?? {}
  const advance = Number(amounts.employee_advance ?? 0)
  const salary = Number(amounts.employee_salary ?? 0)
  const total = advance + salary
  const count = totals?.count ?? 0
  const rows = tx.data?.transactions ?? []
  const totalPages = tx.data?.pagination.total_pages ?? 1
  const transactionsFetching = tx.isFetching && !tx.isLoading
  const transactionsLoading = tx.isLoading
  const hasRange = Boolean(appliedFrom || appliedTo)

  function handleSave(input: EmployeeInput): void {
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

  function handleSaveTransaction(input: TransactionInput): void {
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
      setRangeError(t('transactions:rangeInvalid'))
      return
    }
    setRangeError(undefined)
    setAppliedFrom(fromInput)
    setAppliedTo(toInput)
    setPage(1)
  }

  function resetFilters(): void {
    setKind('')
    setFromInput('')
    setToInput('')
    setAppliedFrom('')
    setAppliedTo('')
    setRangeError(undefined)
    setPage(1)
  }

  if (tx.isLoading) {
    return (
      <DetailPageSkeleton actions={4}>
        <Card className="min-w-0">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-sm sm:w-36" />
          </div>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
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

  if (tx.isError || !brief) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error">{t('employees:loadError')}</Alert>
        <Link
          to={paths.employees}
          className="self-start font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('employees:backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={paths.employees}
        className="inline-flex items-center gap-1 self-start font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t("employees:backToList")}
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <EmployeeAvatar name={brief.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 font-heading text-xl font-bold text-charcoal wrap-anywhere sm:text-2xl">
                {brief.name}
              </h2>
              <StatusBadge active={brief.is_active} />
            </div>
            <p className="mt-1 truncate text-sm text-charcoal-500">
              {brief.role_title || t("employees:noRole")}
            </p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:flex-wrap">
          <Link
            to={attendanceDetail(brief.id)}
            className={cn(buttonVariants({ variant: "secondary" }), "truncate")}
          >
            <CalendarCheck aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{t("attendance:openAttendance")}</span>
          </Link>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" className="size-4 shrink-0" />
            {t("common:edit")}
          </Button>
          <Button
            variant="outlined"
            loading={update.isPending}
            onClick={() => update.mutate({ is_active: !brief.is_active })}
          >
            {brief.is_active ? (
              <UserX aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <UserCheck aria-hidden="true" className="size-4 shrink-0" />
            )}
            <span className="truncate">
              {brief.is_active
                ? t("employees:markInactive")
                : t("employees:markActive")}
            </span>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            {t("common:delete")}
          </Button>
        </div>
      </div>

      <Card className="min-w-0">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{t("transactions:sectionTitle")}</CardTitle>
            <CardDescription>
              {t("transactions:sectionSubtitle")}
            </CardDescription>
          </div>
          <Button onClick={openCreateTransaction} className="w-full sm:w-auto">
            <Plus aria-hidden="true" className="size-4" />
            {t("transactions:add")}
          </Button>
        </div>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <Stat
              label={t("transactions:totals.advance")}
              value={formatMoney(advance, language)}
              loading={transactionsLoading}
            />
            <Stat
              label={t("transactions:totals.salary")}
              value={formatMoney(salary, language)}
              loading={transactionsLoading}
            />
            <Stat
              label={t("transactions:totals.total")}
              value={formatMoney(total, language)}
              loading={transactionsLoading}
            />
          </div>

          <div className="rounded-sm bg-canvas-alt p-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FormField
                id="tx-from"
                label={t("transactions:filters.from")}
                error={rangeError}
              >
                {(describedBy) => (
                  <BsDatePicker
                    id="tx-from"
                    value={fromInput}
                    onChange={setFromInput}
                    language={language}
                    openLabel={t("common:pickDate")}
                    placeholder="2083-08-01"
                    invalid={Boolean(rangeError)}
                    describedBy={describedBy}
                  />
                )}
              </FormField>
              <FormField id="tx-to" label={t("transactions:filters.to")}>
                {(describedBy) => (
                  <BsDatePicker
                    id="tx-to"
                    value={toInput}
                    onChange={setToInput}
                    language={language}
                    openLabel={t("common:pickDate")}
                    placeholder="2083-08-29"
                    invalid={Boolean(rangeError)}
                    describedBy={describedBy}
                  />
                )}
              </FormField>
              <FormField
                id="tx-filter-kind"
                label={t("transactions:filters.kind")}
              >
                {(describedBy) => (
                  <Select
                    id="tx-filter-kind"
                    aria-describedby={describedBy}
                    value={kind}
                    onChange={(event) => {
                      setKind(event.target.value as EmployeeTxKind | "");
                      setPage(1);
                    }}
                  >
                    <option value="">
                      {t("transactions:filters.allKinds")}
                    </option>
                    {employeeTxKinds.map((value) => (
                      <option key={value} value={value}>
                        {translate(t, `employees.kinds.${value}`)}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
                <Button size="sm" onClick={applyRange}>
                  {t("transactions:filters.apply")}
                </Button>
                <Button size="sm" variant="secondary" onClick={resetFilters}>
                  {t("transactions:filters.reset")}
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
                {totals ? t("transactions:totals.count", { count }) : "…"}
              </span>
            </div>
          </div>

          {tx.isError ? (
            <Alert variant="error">{t("transactions:loadError")}</Alert>
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
                "transition-opacity",
                transactionsFetching ? "opacity-60" : "",
              )}
            >
              <ul className="divide-y divide-line overflow-hidden rounded-sm border border-line md:hidden">
                {rows.length === 0 ? (
                  <li className="px-3 py-8 text-center text-sm text-charcoal-500">
                    {hasRange || kind
                      ? t("transactions:empty")
                      : t("transactions:emptyAll")}
                  </li>
                ) : (
                  rows.map((transaction) => (
                    <TransactionMobileRow
                      key={transaction.id}
                      transaction={transaction}
                      language={language}
                      onEdit={() => openEditTransaction(transaction)}
                      onDelete={() => {
                        setTxDeleteError(undefined);
                        setTxDeleting(transaction);
                      }}
                    />
                  ))
                )}
              </ul>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left md:min-w-xl">
                  <thead>
                    <tr className="border-b border-line font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                      <th scope="col" className="px-3 py-2 font-semibold">
                        {t("transactions:columns.date")}
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        {t("transactions:columns.kind")}
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-2 font-semibold sm:table-cell"
                      >
                        {t("transactions:columns.paymentMethod")}
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-2 font-semibold md:table-cell"
                      >
                        {t("transactions:columns.note")}
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-right font-semibold"
                      >
                        {t("transactions:columns.amount")}
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-right font-semibold"
                      >
                        {t("transactions:columns.actions")}
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
                          {hasRange || kind
                            ? t("transactions:empty")
                            : t("transactions:emptyAll")}
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
                            setTxDeleteError(undefined);
                            setTxDeleting(transaction);
                          }}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                className="flex-1 sm:flex-none"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                {t("transactions:previous")}
              </Button>
              <span className="order-first w-full text-center font-ui text-sm text-charcoal-500 sm:order-0 sm:w-auto">
                {t("transactions:pageOf", { page, total: totalPages })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                className="flex-1 sm:flex-none"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                {t("transactions:next")}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal
        open={editing}
        onOpenChange={(open) => {
          setEditing(open);
          if (!open) setFormError(undefined);
        }}
      >
        <ModalContent
          title={t("employees:editTitle")}
          description={t("employees:editSubtitle")}
          closeLabel={t("common:close")}
        >
          {editEmployee.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </div>
          ) : editEmployee.isError || !editEmployee.data ? (
            <Alert variant="error">{t("employees:loadError")}</Alert>
          ) : (
            <EmployeeForm
              employee={editEmployee.data}
              pending={update.isPending}
              error={formError}
              submitLabel={t("common:save")}
              onSave={handleSave}
              onCancel={() => {
                setEditing(false);
                setFormError(undefined);
              }}
            />
          )}
        </ModalContent>
      </Modal>

      <Modal
        open={txOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeTransactionModal();
            return;
          }
          setTxOpen(true);
        }}
      >
        <ModalContent
          title={
            txEditing ? t("transactions:editTitle") : t("transactions:addTitle")
          }
          description={
            txEditing
              ? t("transactions:editSubtitle", { name: brief.name })
              : t("transactions:addSubtitle", { name: brief.name })
          }
          closeLabel={t("common:close")}
        >
          <TransactionForm
            key={txEditing?.id ?? "new"}
            employeeId={brief.id}
            defaultDate={defaultDate}
            transaction={txEditing ?? undefined}
            submitLabel={
              txEditing ? t("transactions:update") : t("transactions:create")
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
            setTxDeleting(null);
            setTxDeleteError(undefined);
          }
        }}
        title={t("transactions:deleteTitle", {
          date: txDeleting?.bs_date ?? "",
        })}
        description={t("transactions:deleteBody")}
        confirmLabel={t("common:confirm")}
        cancelLabel={t("common:cancel")}
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
        title={t("employees:deleteTitle", { name: brief.name })}
        description={t("employees:deleteBody")}
        confirmLabel={t("common:confirm")}
        cancelLabel={t("common:cancel")}
        pending={remove.isPending}
        onConfirm={() => {
          remove.mutate(undefined, {
            onSuccess() {
              setConfirmOpen(false);
              navigate(paths.employees, { replace: true });
            },
          });
        }}
      />
    </div>
  );
}

function TransactionMobileRow({
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
  const { t } = useTranslation(['employees', 'transactions', 'common'])
  const payment = transaction.payment_method
    ? translate(t, `employees.paymentMethods.${transaction.payment_method}`)
    : '—'

  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="whitespace-nowrap font-ui text-sm text-charcoal">
            {transaction.bs_date}
          </p>
          <p className="mt-0.5 font-ui text-sm font-semibold text-charcoal">
            {translate(t, `employees.kinds.${transaction.kind}`)}
          </p>
        </div>
        <span className="shrink-0 text-right font-ui text-sm font-semibold text-charcoal wrap-anywhere">
          {formatMoney(transaction.amount, language)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-xs text-charcoal-500">
        <span>{payment}</span>
        {transaction.note ? (
          <span className="min-w-0 line-clamp-2 wrap-anywhere">
            {transaction.note}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex justify-end gap-1">
        <IconButton
          label={t("common:edit")}
          variant="outlined"
          size="sm"
          onClick={onEdit}
        >
          <Pencil aria-hidden="true" className="size-4" />
        </IconButton>
        <IconButton
          label={t("common:delete")}
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </li>
  );
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
  const { t } = useTranslation(['employees', 'transactions', 'common'])
  const payment = transaction.payment_method
    ? translate(t, `employees.paymentMethods.${transaction.payment_method}`)
    : '—'
  return (
    <tr className="transition-colors hover:bg-card-alt">
      <td className="whitespace-nowrap px-3 py-3 font-ui text-sm text-charcoal">
        {transaction.bs_date}
      </td>
      <td className="px-3 py-3">
        <span className="block font-ui text-sm font-semibold text-charcoal">
          {translate(t, `employees.kinds.${transaction.kind}`)}
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
        <span className="mt-1 block font-heading text-lg font-bold text-charcoal tabular-nums wrap-anywhere">
          {value}
        </span>
      )}
    </div>
  );
}

function EmployeeAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center rounded-pill bg-wood-100 font-ui text-base font-bold text-primary"
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
