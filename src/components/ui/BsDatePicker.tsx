import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Input } from 'src/components/ui/Input'
import { toAsciiDigits, toNepaliDigits } from 'src/lib/bsDate'
import {
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  bsFirstWeekday,
  bsMonthLength,
  formatBsDate,
  isSameBsDate,
  parseBsDate,
  shiftBsMonth,
  todayBs,
} from 'src/lib/bsCalendar'
import { cn } from 'src/lib/cn'
import { translate } from 'src/lib/i18n'

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export interface BsDatePickerProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  language: 'en' | 'ne'
  openLabel: string
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}

export function BsDatePicker({
  id,
  value,
  onChange,
  onBlur,
  language,
  openLabel,
  placeholder,
  invalid,
  describedBy,
}: BsDatePickerProps) {
  const { t, i18n } = useTranslation('common')
  const resolvedLanguage = i18n.resolvedLanguage === 'ne' ? 'ne' : language
  const selected = parseBsDate(value)
  const today = todayBs()

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const base = selected ?? today
    return { year: base.year, month: base.month }
  })
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const next = parseBsDate(value)
    if (next) setView({ year: next.year, month: next.month })
  }, [value])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function openCalendar() {
    if (!open) {
      const base = selected ?? today
      setView({ year: base.year, month: base.month })
    }
    setOpen((current) => !current)
  }

  function moveMonth(delta: number) {
    setView((current) => shiftBsMonth(current.year, current.month, delta))
  }

  function selectDay(day: number) {
    onChange(formatBsDate({ year: view.year, month: view.month, day }))
    setOpen(false)
  }

  function selectToday() {
    onChange(formatBsDate(today))
    setView({ year: today.year, month: today.month })
    setOpen(false)
  }

  function clearDate() {
    onChange('')
    setOpen(false)
  }

  function handleBlur() {
    const normalized = toAsciiDigits(value.trim())
    const parsed = parseBsDate(normalized)
    const next = parsed ? formatBsDate(parsed) : normalized
    if (next !== value) onChange(next)
    onBlur?.()
  }

  const firstWeekday = bsFirstWeekday(view.year, view.month)
  const daysInMonth = bsMonthLength(view.year, view.month)
  const cells: Array<number | null> = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)

  const monthName = translate(t, `common.bsMonths.${view.month}`)
  const yearLabel =
    resolvedLanguage === 'ne' ? toNepaliDigits(view.year) : String(view.year)
  const atStart = view.year === MIN_BS_YEAR && view.month === 1
  const atEnd = view.year === MAX_BS_YEAR && view.month === 12

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="numeric"
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className="pr-11"
      />
      <button
        type="button"
        onClick={openCalendar}
        aria-label={openLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-sm text-charcoal-500 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <CalendarDays aria-hidden="true" className="size-5" />
      </button>

      {open ? (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-charcoal/25 sm:hidden"
          />
          <div
            role="dialog"
            aria-label={openLabel}
            className={cn(
              "z-50 rounded-md border border-line bg-card p-3 shadow-xl",
              "fixed inset-x-4 top-1/2 -translate-y-1/2",
              "sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:w-76 sm:max-w-[calc(100vw-2rem)] sm:translate-y-0",
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-1">
              <div className="flex items-center">
                <CalendarButton
                  label={t("previousYear")}
                  disabled={atStart}
                  onClick={() => moveMonth(-12)}
                >
                  <ChevronsLeft aria-hidden="true" className="size-4" />
                </CalendarButton>
                <CalendarButton
                  label={t("previousMonth")}
                  disabled={atStart}
                  onClick={() => moveMonth(-1)}
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                </CalendarButton>
              </div>
              <div className="text-center">
                <span className="block font-heading text-sm font-bold text-charcoal">
                  {monthName}
                </span>
                <span className="block font-ui text-xs text-charcoal-500">
                  {yearLabel}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarButton
                  label={t("nextMonth")}
                  disabled={atEnd}
                  onClick={() => moveMonth(1)}
                >
                  <ChevronRight aria-hidden="true" className="size-4" />
                </CalendarButton>
                <CalendarButton
                  label={t("nextYear")}
                  disabled={atEnd}
                  onClick={() => moveMonth(12)}
                >
                  <ChevronsRight aria-hidden="true" className="size-4" />
                </CalendarButton>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_KEYS.map((key) => (
                <span
                  key={key}
                  className="grid h-7 place-items-center font-ui text-[10px] font-semibold uppercase tracking-wide text-charcoal-400"
                >
                  {translate(t, `common.weekdays.${key}`)}
                </span>
              ))}

              {cells.map((day, index) => {
                if (day === null) {
                  return <span key={`empty-${index}`} aria-hidden="true" />;
                }

                const isSelected = isSameBsDate(selected, {
                  year: view.year,
                  month: view.month,
                  day,
                });
                const isToday = isSameBsDate(today, {
                  year: view.year,
                  month: view.month,
                  day,
                });

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    aria-label={formatBsDate({
                      year: view.year,
                      month: view.month,
                      day,
                    })}
                    aria-pressed={isSelected}
                    className={cn(
                      "grid h-8 w-full place-items-center rounded-sm font-ui text-sm transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isSelected
                        ? "bg-primary font-semibold text-white"
                        : "text-charcoal hover:bg-canvas-alt",
                      !isSelected && isToday
                        ? "ring-1 ring-inset ring-primary/50"
                        : "",
                    )}
                  >
                    {resolvedLanguage === "ne" ? toNepaliDigits(day) : day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
              <FooterButton onClick={selectToday}>{t("today")}</FooterButton>
              <div className="flex items-center gap-1">
                <FooterButton onClick={clearDate} muted>
                  {t("clearDate")}
                </FooterButton>
                <FooterButton onClick={() => setOpen(false)} muted>
                  {t("close")}
                </FooterButton>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CalendarButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-8 place-items-center rounded-sm text-charcoal-500 transition-colors hover:bg-canvas-alt hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  )
}

function FooterButton({
  onClick,
  muted = false,
  children,
}: {
  onClick: () => void
  muted?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-sm px-2 py-1 font-ui text-xs font-semibold transition-colors hover:bg-canvas-alt',
        muted ? 'text-charcoal-500' : 'text-primary',
      )}
    >
      {children}
    </button>
  )
}

