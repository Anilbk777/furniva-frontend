import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from 'src/lib/cn'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'info'
  children: ReactNode
}

const variantClass = {
  error: 'border-danger-200 bg-danger-50 text-danger-800',
  success: 'border-pine-200 bg-pine-50 text-pine-800',
  info: 'border-wood-200 bg-wood-50 text-wood-800',
} as const

export function Alert({ variant = 'info', className, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-sm border px-4 py-3 text-sm', variantClass[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}
