import type { InputHTMLAttributes } from 'react'

import { cn } from 'src/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex min-h-11 w-full rounded-sm border border-line bg-card-alt px-3 text-base text-charcoal placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  )
}
