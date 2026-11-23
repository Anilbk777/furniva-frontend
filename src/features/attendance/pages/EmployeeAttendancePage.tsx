import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  CircleSlash,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  UserMinus,
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
import { FormField } from 'src/components/ui/FormField'
import { IconButton } from 'src/components/ui/IconButton'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { Skeleton } from 'src/components/ui/Skeleton'
import { StatCard } from 'src/components/ui/StatCard'
import {
  AttendanceAvatar,
  AttendanceStatusBadge,
} from 'src/features/attendance/components/AttendanceBits'
import { AttendanceForm } from 'src/features/attendance/components/AttendanceForm'
import { useAttendanceDetails } from 'src/features/attendance/hooks/useAttendanceDetails'
import {
  useCreateAttendance,
  useDeleteAttendance,
  useUpdateAttendance,
} from 'src/features/attendance/hooks/useAttendanceMutations'
import type { AttendanceFormOutput } from 'src/features/attendance/schemas/attendance.schemas'
import type { AttendanceRecord } from 'src/features/attendance/types'
import { formatApiTimeDisplay } from 'src/features/attendance/utils/time'
import { mapApiError } from 'src/features/auth'
import { formatBsDate, todayBs, todayBsString } from 'src/lib/bsCalendar'
import { cn } from 'src/lib/cn'
import { formatNumber } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { employeeDetail, paths } from 'src/lib/paths'

const currentMonth = todayBs()
const monthStart = formatBsDate({
  year: currentMonth.year,
  month: currentMonth.month,
  day: 1,
})
const todayDate = todayBsString()
const PAGE_SIZE = 10

export function EmployeeAttendancePage() {
  const { employeeId } = useParams()
  const { t, i18n } = useTranslation(['attendance', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [fromInput, setFromInput] = useState(monthStart)
  const [toInput, setToInput] = useState(todayDate)
  const [appliedFrom, setAppliedFrom] = useState(monthStart)
  const [appliedTo, setAppliedTo] = useState(todayDate)
  const [rangeError, setRangeError] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)
  const [formError, setFormError] = useState<string | undefined>()
  const [deleting, setDeleting] = useState<AttendanceRecord | null>(null)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const details = useAttendanceDetails(employeeId, appliedFrom, appliedTo)
  const create = useCreateAttendance()
  const update = useUpdateAttendance()
  const remove = useDeleteAttendance()

  const data = details.data
  const records = data?.records ?? []
  const summary = data?.summary
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedRecords = records.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const fetching = details.isFetching && !details.isLoading
  const errorMessage = details.isError
    ? translate(t, mapApiError(details.error).messageKey)
    : undefined

  const defaultDate =
    todayDate >= appliedFrom && todayDate <= appliedTo ? todayDate : appliedTo

  function openCreate(): void {
    setEditing(null)
    setFormError(undefined)
    setFormOpen(true)
  }

  function openEdit(record: AttendanceRecord): void {
    setEditing(record)
    setFormError(undefined)
    setFormOpen(true)
  }

  function closeForm(): void {
    setFormOpen(false)
    setEditing(null)
    setFormError(undefined)
  }

  function handleSave(values: AttendanceFormOutput): void {
    setFormError(undefined)
    if (!data) return

    if (editing) {
      update.mutate(
        { attendanceId: editing.id, input: values },
        {
          onSuccess: closeForm,
          onError(error: unknown) {
            setFormError(translate(t, mapApiError(error).messageKey))
          },
        },
      )
      return
    }

    create.mutate(
      { employee_id: data.employee.id, ...values },
      {
        onSuccess: closeForm,
        onError(error: unknown) {
          setFormError(translate(t, mapApiError(error).messageKey))
        },
      },
    )
  }

  function handleDelete(): void {
    if (!deleting) return
    setDeleteError(undefined)
    remove.mutate(deleting.id, {
      onSuccess() {
        setDeleting(null)
      },
      onError(error: unknown) {
        setDeleteError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  function applyRange(): void {
    if (!fromInput || !toInput) {
      setRangeError(t('attendance:rangeRequired'))
      return
    }
    if (fromInput > toInput) {
      setRangeError(t('attendance:rangeInvalid'))
      return
    }
    setRangeError(undefined)
    setAppliedFrom(fromInput)
    setAppliedTo(toInput)
    setPage(1)
  }

  function resetRange(): void {
    setFromInput(monthStart)
    setToInput(todayDate)
    setAppliedFrom(monthStart)
    setAppliedTo(todayDate)
    setRangeError(undefined)
    setPage(1)
  }

  if (details.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-pill" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error">{errorMessage ?? t('attendance:loadError')}</Alert>
        <Link
          to={paths.attendance}
          className="self-start font-ui text-sm font-semibold text-primary underline underline-offset-4"
        >
          {t('attendance:backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={paths.attendance}
        className="inline-flex items-center gap-1 self-start font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t("attendance:backToList")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AttendanceAvatar name={data.employee.name} size="md" />
          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-bold text-charcoal">
              {data.employee.name}
            </h2>
            <p className="mt-1 text-sm text-charcoal-500">
              {t("attendance:detailsSubtitle", {
                from: data.from_date,
                to: data.to_date,
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={employeeDetail(data.employee.id)}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            {t("attendance:employeeProfile")}
          </Link>
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" className="size-4" />
            {t("attendance:add")}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 p-5">
          <div>
            <CardTitle>{t("attendance:summaryTitle")}</CardTitle>
            <CardDescription>{t("attendance:summarySubtitle")}</CardDescription>
          </div>
          {fetching ? (
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin text-charcoal-400"
            />
          ) : null}
        </div>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label={t("attendance:summary.totalDays")}
              value={formatNumber(summary?.total_days ?? 0, language)}
              icon={<CalendarDays aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.present")}
              value={formatNumber(summary?.present ?? 0, language)}
              icon={<UserCheck aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.halfDay")}
              value={formatNumber(summary?.half_day ?? 0, language)}
              icon={<UserMinus aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.absent")}
              value={formatNumber(summary?.absent ?? 0, language)}
              icon={<CircleSlash aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.leave")}
              value={formatNumber(summary?.leave ?? 0, language)}
              icon={<CalendarCheck aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.workedDays")}
              value={formatNumber(summary?.worked_days ?? 0, language)}
              icon={<CalendarCheck aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.unmarkedDays")}
              value={formatNumber(summary?.unmarked_days ?? 0, language)}
              icon={<CalendarDays aria-hidden="true" className="size-4" />}
            />
            <StatCard
              label={t("attendance:summary.overtime")}
              value={formatNumber(summary?.total_overtime_hours ?? 0, language)}
              icon={<Clock3 aria-hidden="true" className="size-4" />}
            />
          </div>
          <p className="mt-3 font-ui text-xs text-charcoal-500">
            {t("attendance:unmarkedHint")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 p-5">
          <div>
            <CardTitle>{t("attendance:recordsTitle")}</CardTitle>
            <CardDescription>{t("attendance:recordsSubtitle")}</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" className="size-4" />
            {t("attendance:add")}
          </Button>
        </div>
        <CardContent className="flex flex-col gap-5">
          <div className="rounded-sm bg-canvas-alt p-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
              <FormField
                id="attendance-range-from"
                label={t("attendance:range.from")}
                error={rangeError}
              >
                {(describedBy) => (
                  <BsDatePicker
                    id="attendance-range-from"
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
              <FormField
                id="attendance-range-to"
                label={t("attendance:range.to")}
              >
                {(describedBy) => (
                  <BsDatePicker
                    id="attendance-range-to"
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
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={applyRange}>
                  {t("attendance:range.apply")}
                </Button>
                <Button size="sm" variant="secondary" onClick={resetRange}>
                  {t("attendance:range.reset")}
                </Button>
              </div>
            </div>
            <p className="mt-3 font-ui text-xs text-charcoal-500">
              {t("attendance:count", { count: data.total_records })}
            </p>
          </div>

          {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

          <div
            className={cn(
              "overflow-x-auto transition-opacity",
              fetching ? "opacity-60" : "",
            )}
          >
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                  <th scope="col" className="px-3 py-2 font-semibold">
                    {t("attendance:columns.date")}
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    {t("attendance:columns.status")}
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    {t("attendance:columns.checkIn")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2 font-semibold sm:table-cell"
                  >
                    {t("attendance:columns.checkOut")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2 text-right font-semibold md:table-cell"
                  >
                    {t("attendance:columns.overtime")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2 font-semibold xl:table-cell"
                  >
                    {t("attendance:columns.note")}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-right font-semibold"
                  >
                    {t("attendance:columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-sm text-charcoal-500"
                    >
                      {t("attendance:emptyRecords")}
                    </td>
                  </tr>
                ) : (
                  pagedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-card-alt"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-ui text-sm text-charcoal">
                        {record.bs_date}
                      </td>
                      <td className="px-3 py-3">
                        <AttendanceStatusBadge status={record.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-ui text-sm text-charcoal-500">
                        {record.check_in
                          ? formatApiTimeDisplay(record.check_in, language)
                          : "—"}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 font-ui text-sm text-charcoal-500 sm:table-cell">
                        {record.check_out
                          ? formatApiTimeDisplay(record.check_out, language)
                          : "—"}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-right font-ui text-sm text-charcoal-500 md:table-cell">
                        {`${formatNumber(record.overtime_hours, language)} ${t("attendance:hoursShort")}`}
                      </td>
                      <td className="hidden max-w-xs px-3 py-3 font-ui text-sm text-charcoal-500 xl:table-cell">
                        {record.note ? (
                          <span className="line-clamp-2">{record.note}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            label={t("attendance:edit")}
                            variant="outlined"
                            size="sm"
                            onClick={() => openEdit(record)}
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                          </IconButton>
                          <IconButton
                            label={t("attendance:delete")}
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteError(undefined);
                              setDeleting(record);
                            }}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
              >
                {t("attendance:previous")}
              </Button>
              <span className="order-first w-full text-center font-ui text-sm text-charcoal-500 sm:order-0 sm:w-auto">
                {t("attendance:pageOf", {
                  page: currentPage,
                  total: totalPages,
                })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              >
                {t("attendance:next")}
              </Button>
            </div>
          ) : null}

          <p className="font-ui text-xs text-charcoal-500">
            {t("attendance:unmarkedHint")}
          </p>
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
            return;
          }
          setFormOpen(true);
        }}
      >
        <ModalContent
          title={editing ? t("attendance:editTitle") : t("attendance:addTitle")}
          description={
            editing
              ? t("attendance:editSubtitle", {
                  name: data.employee.name,
                  date: editing.bs_date,
                })
              : t("attendance:addSubtitle", {
                  name: data.employee.name,
                  date: defaultDate,
                })
          }
          closeLabel={t("common:close")}
        >
          <AttendanceForm
            key={editing?.id ?? "new"}
            employeeName={data.employee.name}
            defaultDate={defaultDate}
            record={editing ?? undefined}
            submitLabel={
              editing ? t("attendance:update") : t("attendance:create")
            }
            pending={editing ? update.isPending : create.isPending}
            error={formError}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
            setDeleteError(undefined);
          }
        }}
        title={t("attendance:deleteTitle", {
          name: data.employee.name,
          date: deleting?.bs_date ?? "",
        })}
        description={t("attendance:deleteBody")}
        confirmLabel={t("common:confirm")}
        cancelLabel={t("common:cancel")}
        pending={remove.isPending}
        onConfirm={handleDelete}
      >
        {deleteError ? (
          <div className="mt-4">
            <Alert variant="error">{deleteError}</Alert>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
