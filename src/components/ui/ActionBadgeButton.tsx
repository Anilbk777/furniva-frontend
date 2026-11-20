import type { LucideIcon } from 'lucide-react'

import { cn } from 'src/lib/cn'
import type { ColorVariant } from 'src/lib/theme'

export interface ActionBadgeButtonProps {
  label: string
  icon: LucideIcon
  variant?: ColorVariant
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

const variantClass = {
  primary: 'bg-primary text-white hover:bg-wood-700',
  secondary: 'bg-secondary text-white hover:bg-amber-700',
  tertiary: 'bg-tertiary text-white hover:bg-pine-700',
  danger: 'bg-danger text-white hover:bg-danger-700',
} as const

export function ActionBadgeButton({
  label,
  icon: Icon,
  variant = 'primary',
  type = 'button',
  className,
  ...props
}: ActionBadgeButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-3 font-ui text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
        variantClass[variant],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="whitespace-normal">{label}</span>
    </button>
  )
}
