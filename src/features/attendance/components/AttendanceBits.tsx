import { useTranslation } from 'react-i18next'

import {
  attendanceStatuses,
  type AttendanceStatus,
} from 'src/features/attendance/types'
import { cn } from 'src/lib/cn'
import { translate } from 'src/lib/i18n'

const toneByStatus: Record<AttendanceStatus | 'unmarked', string> = {
  present: 'bg-pine-100 text-pine-700',
  half_day: 'bg-amber-100 text-amber-700',
  absent: 'bg-danger-100 text-danger-700',
  leave: 'bg-wood-100 text-wood-700',
  unmarked: 'border border-dashed border-line bg-canvas-alt text-charcoal-500',
}

export function AttendanceStatusBadge({
  status,
  className,
}: {
  status?: AttendanceStatus | string | null
  className?: string
}) {
  const { t } = useTranslation('attendance')
  const known = status && attendanceStatuses.includes(status as AttendanceStatus)
  const tone = known ? (status as AttendanceStatus) : 'unmarked'
  const label = known
    ? translate(t, `attendance.status.${tone}`)
    : translate(t, 'attendance.status.unmarked')

  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 font-ui text-[10px] font-semibold',
        toneByStatus[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}

export function AttendanceAvatar({
  name,
  size = 'sm',
}: {
  name: string
  size?: 'sm' | 'md'
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-pill bg-wood-100 font-ui font-bold text-primary',
        size === 'md' ? 'size-12 text-base' : 'size-10 text-sm',
      )}
    >
      {initials || '?'}
    </span>
  )
}
