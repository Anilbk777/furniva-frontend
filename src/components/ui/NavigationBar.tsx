import type { LucideIcon } from 'lucide-react'

import { cn } from 'src/lib/cn'

export interface NavigationItem {
  label: string
  icon: LucideIcon
  active?: boolean
  onClick: () => void
}

export interface NavigationBarProps {
  label: string
  items: NavigationItem[]
  className?: string
}

export function NavigationBar({ label, items, className }: NavigationBarProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-pill bg-nav p-1.5 shadow-sm',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-current={item.active ? 'page' : undefined}
            onClick={item.onClick}
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-pill px-2"
          >
            <span
              className={cn(
                'grid size-8 place-items-center rounded-nav-active transition-colors',
                item.active ? 'bg-primary text-white' : 'text-charcoal',
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
            </span>
          </button>
        )
      })}
    </nav>
  )
}
