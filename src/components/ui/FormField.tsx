import type { ReactNode } from 'react'

import { Label } from 'src/components/ui/Label'

export interface FormFieldProps {
  id: string
  label: string
  children: ReactNode | ((describedBy?: string) => ReactNode)
  error?: string
  hint?: string
}

export function FormField({ id, label, children, error, hint }: FormFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {typeof children === 'function' ? children(describedBy) : children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="font-ui text-xs text-charcoal-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-ui text-sm text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
