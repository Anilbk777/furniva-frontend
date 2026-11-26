import { toNepaliDigits } from 'src/lib/bsDate'

export type Meridiem = 'AM' | 'PM'

export interface TimeParts {
  hour: number
  minute: number
  meridiem: Meridiem
}

const TIME_PATTERN = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s*([AaPp][Mm])$/

export function parseApiTime(value: string | null | undefined): TimeParts | null {
  if (!value) return null
  const match = TIME_PATTERN.exec(value.trim())
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3]?.toUpperCase() === 'PM' ? 'PM' : 'AM'
  return { hour, minute, meridiem }
}

export function formatApiTime(parts: TimeParts): string {
  const hour = String(parts.hour).padStart(2, '0')
  const minute = String(parts.minute).padStart(2, '0')
  return `${hour}:${minute} ${parts.meridiem}`
}

export function timeToMinutes(value: string | null | undefined): number | null {
  const parts = parseApiTime(value)
  if (!parts) return null
  const hour = (parts.hour % 12) + (parts.meridiem === 'PM' ? 12 : 0)
  return hour * 60 + parts.minute
}

export function formatApiTimeDisplay(
  value: string | null | undefined,
  language: 'en' | 'ne',
): string {
  const parts = parseApiTime(value)
  if (!parts) return value?.trim() || '—'

  const clock = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
  if (language === 'ne') {
    return `${toNepaliDigits(clock)} ${parts.meridiem === 'AM' ? 'पूर्वाह्न' : 'अपराह्न'}`
  }
  return `${clock} ${parts.meridiem}`
}
