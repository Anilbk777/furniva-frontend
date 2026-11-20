import { forwardRef, useImperativeHandle, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from 'src/lib/cn'

export interface OtpInputHandle {
  focusFirst: () => void
  clear: () => void
}

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: string
  disabled?: boolean
}

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(function OtpInput(
  { value, onChange, onComplete, error, disabled },
  ref,
) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const { t } = useTranslation('auth')

  useImperativeHandle(ref, () => ({
    focusFirst() {
      inputs.current[0]?.focus()
    },
    clear() {
      onChange('')
      inputs.current[0]?.focus()
    },
  }))

  function setDigit(index: number, digit: string): void {
    const digits = value.padEnd(6, ' ').split('')
    digits[index] = digit
    const next = digits.join('').trimEnd()
    onChange(next)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
    if (next.length === 6) onComplete?.(next)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Backspace' || value[index]) return
    if (index > 0) {
      const digits = value.padEnd(6, ' ').split('')
      digits[index - 1] = ' '
      onChange(digits.join('').trimEnd())
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    event.preventDefault()
    onChange(pasted)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) onComplete?.(pasted)
  }

  return (
    <div>
      <div className="grid grid-cols-6 gap-1.5" role="group" aria-label={t('verificationCode')}>
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element
            }}
            aria-label={t('otpDigit', { index: index + 1 })}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'otp-error' : undefined}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            value={value[index] ?? ''}
            onChange={(event) => setDigit(index, event.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className={cn(
              'h-12 min-w-0 rounded-sm border border-line bg-card-alt text-center font-ui text-lg font-semibold text-charcoal',
              error && 'border-danger',
            )}
          />
        ))}
      </div>
      {error ? (
        <p id="otp-error" role="alert" className="mt-2 font-ui text-sm text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  )
})
