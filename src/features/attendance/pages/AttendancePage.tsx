import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  ChevronRight,
  CircleSlash,
  Loader2,
  Pencil,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { Card } from 'src/components/ui/Card'
import { ConfirmDialog } from 'src/components/ui/ConfirmDialog'
import { IconButton } from 'src/components/ui/IconButton'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { SearchInput } from 'src/components/ui/SearchInput'
import { Skeleton } from 'src/components/ui/Skeleton'
import { StatCard } from 'src/components/ui/StatCard'
import {
  AttendanceAvatar,
  AttendanceStatusBadge,
} from 'src/features/attendance/components/AttendanceBits'
import { AttendanceForm } from 'src/features/attendance/components/AttendanceForm'
import {
  useCreateAttendance,
  useDeleteAttendance,
  useUpdateAttendance,
} from 'src/features/attendance/hooks/useAttendanceMutations'
import { useTodayAttendance } from 'src/features/attendance/hooks/useTodayAttendance'
import type { AttendanceFormOutput } from 'src/features/attendance/schemas/attendance.schemas'
import type {
  AttendanceRecord,
  AttendanceStatus,
} from 'src/features/attendance/types'
import { mapApiError } from 'src/features/auth'
import { formatApiTimeDisplay } from 'src/lib/time'
import { parseBsDate, todayBsString } from 'src/lib/bsCalendar'
import { toNepaliDigits } from 'src/lib/bsDate'
import { cn } from 'src/lib/cn'
import { formatNumber } from 'src/lib/format'
import { translate } from 'src/lib/i18n'
import { attendanceDetail, paths } from 'src/lib/paths'

type StatusFilter = 'all' | AttendanceStatus | 'unmarked'

const FILTERS: StatusFilter[] = [
  'all',
  'present',
  'half_day',
  'absent',
  'leave',
  'unmarked',
]

const PAGE_SIZE = 10

interface RosterEmployee {
  id: string
  name: string
  role_title: string | null
}

interface RosterRow {
  employee: RosterEmployee
  record: AttendanceRecord | null
}

type FormEmployee = Pick<RosterEmployee, 'id' | 'name'>

export function AttendancePage() {
  const { t, i18n } = useTranslation(['attendance', 'common', 'errors'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formEmployee, setFormEmployee] = useState<FormEmployee | null>(null)
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)
  const [formError, setFormError] = useState<string | undefined>()
  const [deleting, setDeleting] = useState<AttendanceRecord | null>(null)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const todayQuery = useTodayAttendance(page, PAGE_SIZE)
  const create = useCreateAttendance()
  const update = useUpdateAttendance()
  const remove = useDeleteAttendance()

  const data = todayQuery.data
  const today = data?.bs_date ?? todayBsString()
  const todayParts = parseBsDate(today)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const roster = useMemo<RosterRow[]>(() => {
    const employees = data?.employees ?? []
    return employees.map((entry) => ({
      employee: {
        id: entry.employee_id,
        name: entry.name,
        role_title: entry.role,
      },
      record: entry.attendance_id
        ? {
            id: entry.attendance_id,
            employee_id: entry.employee_id,
            employee_name: entry.name,
            bs_date: entry.bs_date,
            status: entry.status ?? '',
            check_in: entry.check_in,
            check_out: entry.check_out,
            overtime_hours: entry.overtime_hours,
            note: entry.note,
            created_at: null,
            updated_at: null,
          }
        : null,
    }))
  }, [data])

  const counts = useMemo(() => {
    const next: Record<AttendanceStatus, number> = {
      present: 0,
      half_day: 0,
      absent: 0,
      leave: 0,
    }
    for (const row of roster) {
      const status = row.record?.status as AttendanceStatus | undefined
      if (status && status in next) next[status] += 1
    }
    return next
  }, [roster])

  const unmarkedCount = roster.filter((row) => !row.record).length
  const loading = todayQuery.isLoading
  const fetching = todayQuery.isFetching && !todayQuery.isLoading
  const loadError = todayQuery.isError

  const filteredRows = roster.filter((row) => {
    const matchesSearch = debouncedSearch
      ? row.employee.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unmarked'
          ? !row.record
          : row.record?.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // const filtered = Boolean(debouncedSearch) || statusFilter !== 'all'
  // const totalEmployees = data?.pagination.total ?? 0
  const totalPages = Math.max(1, data?.pagination.total_pages ?? 1)
  const currentPage = Math.min(page, totalPages)

  const todayLabel = todayParts
    ? [
        translate(t, `common.bsMonths.${todayParts.month}`),
        `${language === 'ne' ? toNepaliDigits(todayParts.day) : todayParts.day},`,
        language === 'ne' ? toNepaliDigits(todayParts.year) : todayParts.year,
      ].join(' ')
    : today

  function changeStatusFilter(value: StatusFilter): void {
    setStatusFilter(value)
    setPage(1)
  }

  function openCreate(employee: FormEmployee): void {
    setEditing(null)
    setFormEmployee(employee)
    setFormError(undefined)
    setFormOpen(true)
  }

  function openEdit(employee: FormEmployee, record: AttendanceRecord): void {
    setEditing(record)
    setFormEmployee(employee)
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

    if (!formEmployee) return
    create.mutate(
      { employee_id: formEmployee.id, ...values },
      {
        onSuccess() {
          closeForm()
          changeStatusFilter('all')
        },
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
        if (roster.length <= 1 && currentPage > 1) {
          setPage(currentPage - 1)
        }
        setDeleting(null)
      },
      onError(error: unknown) {
        setDeleteError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  function handleRowClick(employeeId: string, event: MouseEvent<HTMLTableRowElement>): void {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(attendanceDetail(employeeId))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold text-charcoal sm:text-2xl">
            {t("attendance:title")}
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            {t("attendance:subtitle")}
          </p>
        </div>
        <div className="rounded-sm border border-line bg-card-alt px-3 py-2 sm:text-right">
          <span className="block font-ui text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">
            {t("attendance:today")}
          </span>
          <span className="mt-0.5 block font-heading text-sm font-bold text-charcoal">
            {todayLabel}
          </span>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
        aria-busy={loading || undefined}
      >
        <StatCard
          label={t("attendance:overview.present")}
          value={counts.present}
          loading={loading}
          icon={<UserCheck aria-hidden="true" className="size-4" />}
          active={statusFilter === "present"}
          onClick={() => changeStatusFilter("present")}
        />
        <StatCard
          label={t("attendance:overview.halfDay")}
          value={counts.half_day}
          loading={loading}
          icon={<UserMinus aria-hidden="true" className="size-4" />}
          active={statusFilter === "half_day"}
          onClick={() => changeStatusFilter("half_day")}
        />
        <StatCard
          label={t("attendance:overview.absent")}
          value={counts.absent}
          loading={loading}
          icon={<CircleSlash aria-hidden="true" className="size-4" />}
          active={statusFilter === "absent"}
          onClick={() => changeStatusFilter("absent")}
        />
        <StatCard
          label={t("attendance:overview.leave")}
          value={counts.leave}
          loading={loading}
          icon={<CalendarCheck aria-hidden="true" className="size-4" />}
          active={statusFilter === "leave"}
          onClick={() => changeStatusFilter("leave")}
        />
        <StatCard
          label={t("attendance:overview.unmarked")}
          value={unmarkedCount}
          loading={loading}
          icon={<Users aria-hidden="true" className="size-4" />}
          active={statusFilter === "unmarked"}
          onClick={() => changeStatusFilter("unmarked")}
          className="col-span-2 md:col-span-1"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-3 lg:max-w-md">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t("attendance:searchPlaceholder")}
            aria-label={t("common:search")}
          />
          {fetching ? (
            <Loader2
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin text-charcoal-400"
            />
          ) : null}
        </div>
        <div
          role="group"
          aria-label={t("attendance:filterLabel")}
          className="grid w-full grid-cols-3 gap-0.5 rounded-sm border border-line bg-card-alt p-0.5 lg:inline-flex lg:w-auto"
        >
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={statusFilter === value}
              onClick={() => changeStatusFilter(value)}
              className={cn(
                "min-h-11 rounded-[3px] px-2 font-ui text-xs font-semibold transition-colors wrap-anywhere lg:px-3",
                statusFilter === value
                  ? "bg-primary text-white"
                  : "text-charcoal hover:bg-charcoal-100",
              )}
            >
              {translate(t, `attendance.filter.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <Alert variant="error">{t("attendance:loadError")}</Alert>
      ) : null}

      {loading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-10 shrink-0 rounded-pill" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-pill" />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!loading && !loadError && roster.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-pill bg-wood-100 text-primary">
            <Users aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              {t("attendance:emptyTodayTitle")}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {t("attendance:emptyTodayBody")}
            </p>
          </div>
          <Link
            to={paths.employees}
            className="font-ui text-sm font-semibold text-primary underline underline-offset-4"
          >
            {t("attendance:manageEmployees")}
          </Link>
        </Card>
      ) : null}

      {!loading &&
      !loadError &&
      roster.length > 0 &&
      filteredRows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-pill bg-wood-100 text-primary">
            <CalendarCheck aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              {t("attendance:emptyFilteredTitle")}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {t("attendance:emptyFilteredBody")}
            </p>
          </div>
        </Card>
      ) : null}

      {!loading && filteredRows.length > 0 ? (
        <Card
          className={cn(
            "overflow-hidden transition-opacity",
            fetching ? "opacity-60" : "",
          )}
        >
          <ul className="divide-y divide-line md:hidden">
            {filteredRows.map((row) => (
              <AttendanceMobileRow
                key={row.employee.id}
                row={row}
                language={language}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={(record) => {
                  setDeleteError(undefined);
                  setDeleting(record);
                }}
              />
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left md:min-w-180">
              <thead className="bg-canvas-alt">
                <tr className="font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("attendance:columns.employee")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("attendance:columns.status")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("attendance:columns.checkIn")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3 font-semibold sm:table-cell"
                  >
                    {t("attendance:columns.checkOut")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3 text-right font-semibold lg:table-cell"
                  >
                    {t("attendance:columns.overtime")}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-5 py-3 font-semibold xl:table-cell"
                  >
                    {t("attendance:columns.note")}
                  </th>
                  <th scope="col" className="w-28 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRows.map((row) => (
                  <tr
                    key={row.employee.id}
                    onClick={(event) => handleRowClick(row.employee.id, event)}
                    className="group cursor-pointer transition-colors hover:bg-card-alt"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={attendanceDetail(row.employee.id)}
                        className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <AttendanceAvatar name={row.employee.name} />
                        <span className="min-w-0">
                          <span className="block truncate font-ui text-sm font-semibold text-charcoal">
                            {row.employee.name}
                          </span>
                          <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
                            {row.employee.role_title || t("attendance:noRole")}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <AttendanceStatusBadge
                        status={row.record?.status ?? null}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-ui text-sm text-charcoal-500">
                      {row.record?.check_in
                        ? formatApiTimeDisplay(row.record.check_in, language)
                        : "—"}
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-3 font-ui text-sm text-charcoal-500 sm:table-cell">
                      {row.record?.check_out
                        ? formatApiTimeDisplay(row.record.check_out, language)
                        : "—"}
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-3 text-right font-ui text-sm text-charcoal-500 lg:table-cell">
                      {row.record
                        ? `${formatNumber(row.record.overtime_hours, language)} ${t("attendance:hoursShort")}`
                        : "—"}
                    </td>
                    <td className="hidden max-w-xs px-5 py-3 font-ui text-sm text-charcoal-500 xl:table-cell">
                      {row.record?.note ? (
                        <span className="line-clamp-2">{row.record.note}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3">
                      <div className="flex justify-end gap-1">
                        {row.record ? (
                          <>
                            <IconButton
                              label={t("attendance:edit")}
                              variant="outlined"
                              size="sm"
                              onClick={() =>
                                openEdit(
                                  row.employee,
                                  row.record as AttendanceRecord,
                                )
                              }
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </IconButton>
                            <IconButton
                              label={t("attendance:delete")}
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeleteError(undefined);
                                setDeleting(row.record as AttendanceRecord);
                              }}
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </IconButton>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => openCreate(row.employee)}
                          >
                            {t("attendance:mark")}
                          </Button>
                        )}
                        <Link
                          to={attendanceDetail(row.employee.id)}
                          aria-label={t("attendance:view", {
                            name: row.employee.name,
                          })}
                          className="inline-grid size-11 place-items-center rounded-sm text-charcoal-400 transition-all hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <ChevronRight aria-hidden="true" className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {!loading && !loadError && totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1}
            className="flex-1 sm:flex-none"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            {t("attendance:previous")}
          </Button>
          <span className="order-first w-full text-center font-ui text-sm text-charcoal-500 sm:order-0 sm:w-auto">
            {t("attendance:pageOf", { page: currentPage, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages}
            className="flex-1 sm:flex-none"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          >
            {t("attendance:next")}
          </Button>
        </div>
      ) : null}


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
                  name: formEmployee?.name ?? "",
                  date: editing.bs_date,
                })
              : t("attendance:addSubtitle", {
                  name: formEmployee?.name ?? "",
                  date: today,
                })
          }
          closeLabel={t("common:close")}
        >
          {formEmployee ? (
            <AttendanceForm
              key={editing?.id ?? `${formEmployee.id}-new`}
              employeeName={formEmployee.name}
              defaultDate={today}
              record={editing ?? undefined}
              submitLabel={
                editing ? t("attendance:update") : t("attendance:create")
              }
              pending={editing ? update.isPending : create.isPending}
              error={formError}
              onSave={handleSave}
              onCancel={closeForm}
            />
          ) : null}
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
          name: deleting?.employee_name ?? "",
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

function AttendanceMobileRow({
  row,
  language,
  onCreate,
  onEdit,
  onDelete,
}: {
  row: RosterRow
  language: 'en' | 'ne'
  onCreate: (employee: FormEmployee) => void
  onEdit: (employee: FormEmployee, record: AttendanceRecord) => void
  onDelete: (record: AttendanceRecord) => void
}) {
  const { t } = useTranslation('attendance')
  const record = row.record

  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={attendanceDetail(row.employee.id)}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <AttendanceAvatar name={row.employee.name} />
          <span className="min-w-0">
            <span className="block truncate font-ui text-sm font-semibold text-charcoal">
              {row.employee.name}
            </span>
            <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
              {row.employee.role_title || t('noRole')}
            </span>
          </span>
        </Link>
        <AttendanceStatusBadge status={record?.status ?? null} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-charcoal-500">
        <span>
          <span className="text-charcoal-400">{t('columns.checkIn')}: </span>
          {record?.check_in ? formatApiTimeDisplay(record.check_in, language) : '—'}
        </span>
        <span>
          <span className="text-charcoal-400">{t('columns.checkOut')}: </span>
          {record?.check_out ? formatApiTimeDisplay(record.check_out, language) : '—'}
        </span>
        <span>
          <span className="text-charcoal-400">{t('columns.overtime')}: </span>
          {record
            ? `${formatNumber(record.overtime_hours, language)} ${t('hoursShort')}`
            : '—'}
        </span>
      </div>

      {record?.note ? (
        <p className="mt-2 line-clamp-2 font-ui text-xs text-charcoal-500">
          {record.note}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {record ? (
          <>
            <IconButton
              label={t('edit')}
              variant="outlined"
              size="sm"
              onClick={() => onEdit(row.employee, record)}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </IconButton>
            <IconButton
              label={t('delete')}
              variant="destructive"
              size="sm"
              onClick={() => onDelete(record)}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </IconButton>
          </>
        ) : (
          <Button size="sm" onClick={() => onCreate(row.employee)}>
            {t('mark')}
          </Button>
        )}
        <Link
          to={attendanceDetail(row.employee.id)}
          aria-label={t('view', { name: row.employee.name })}
          className="ml-auto inline-grid size-11 place-items-center rounded-sm text-charcoal-400 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </li>
  )
}

