import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from 'src/components/ui/Select'
import { formatApiTime, parseApiTime, type Meridiem } from 'src/lib/time'
import { toNepaliDigits } from 'src/lib/bsDate'
import { cn } from 'src/lib/cn'

interface TimePartsState {
  hour: string
  minute: string
  meridiem: '' | Meridiem
}

function partsFromValue(value: string): TimePartsState {
  const parts = parseApiTime(value)
  if (!parts) return { hour: '', minute: '', meridiem: '' }
  return {
    hour: String(parts.hour),
    minute: String(parts.minute).padStart(2, '0'),
    meridiem: parts.meridiem,
  }
}

export interface Time12PickerProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
  className?: string
}

export function Time12Picker({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  disabled,
  className,
}: Time12PickerProps) {
  const { t, i18n } = useTranslation('common')
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const [state, setState] = useState<{ source: string; parts: TimePartsState }>(
    () => ({ source: value, parts: partsFromValue(value) }),
  )
  const parts = state.source === value ? state.parts : partsFromValue(value)

  function digits(value: string | number): string {
    const text = String(value)
    return language === 'ne' ? toNepaliDigits(text) : text
  }

  function update(next: TimePartsState): void {
    const nextValue =
      next.hour && next.minute && next.meridiem
        ? formatApiTime({
            hour: Number(next.hour),
            minute: Number(next.minute),
            meridiem: next.meridiem,
          })
        : ''
    setState({ source: nextValue, parts: next })
    onChange(nextValue)
  }

  const sharedProps = {
    onBlur,
    disabled,
    'aria-invalid': invalid ? true : undefined,
    'aria-describedby': describedBy,
    className: 'px-2 text-sm',
  }

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      <Select
        id={id}
        {...sharedProps}
        aria-label={t('time.hour')}
        value={parts.hour}
        onChange={(event) => update({ ...parts, hour: event.target.value })}
      >
        <option value="">{t('time.placeholder')}</option>
        {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
          <option key={hour} value={hour}>
            {digits(String(hour).padStart(2, '0'))}
          </option>
        ))}
      </Select>

      <Select
        {...sharedProps}
        aria-label={t('time.minute')}
        value={parts.minute}
        onChange={(event) => update({ ...parts, minute: event.target.value })}
      >
        <option value="">{t('time.placeholder')}</option>
        {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
          <option key={minute} value={String(minute).padStart(2, '0')}>
            {digits(String(minute).padStart(2, '0'))}
          </option>
        ))}
      </Select>

      <Select
        {...sharedProps}
        aria-label={t('time.meridiem')}
        value={parts.meridiem}
        onChange={(event) =>
          update({ ...parts, meridiem: event.target.value as '' | Meridiem })
        }
      >
        <option value="">{t('time.placeholder')}</option>
        <option value="AM">{t('time.am')}</option>
        <option value="PM">{t('time.pm')}</option>
      </Select>
    </div>
  )
}
