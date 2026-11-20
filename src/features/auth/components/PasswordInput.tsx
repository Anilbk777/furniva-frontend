import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input, type InputProps } from 'src/components/ui/Input'

export interface PasswordInputProps {
  id: string
  inputProps: InputProps
  showLabel: string
  hideLabel: string
  error?: string
}

export function PasswordInput({ id, inputProps, showLabel, hideLabel, error }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...inputProps}
        id={id}
        type={visible ? 'text' : 'password'}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : inputProps['aria-describedby']}
        className="pr-12"
      />
      <button
        type="button"
        aria-label={visible ? hideLabel : showLabel}
        onClick={() => setVisible((value) => !value)}
        className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-sm text-charcoal-500 hover:bg-charcoal-100"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  )
}
