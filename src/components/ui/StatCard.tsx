import type { ReactNode } from 'react'

import { Skeleton } from 'src/components/ui/Skeleton'
import { cn } from 'src/lib/cn'

export interface StatCardProps {
  label: string
  value?: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  loading?: boolean
  active?: boolean
  onClick?: () => void
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading = false,
  active,
  onClick,
  className,
}: StatCardProps) {
  const body = (
    <>
      <span className="flex min-w-0 items-start justify-between gap-2">
        <span className="min-w-0 font-ui text-[11px] font-semibold uppercase tracking-wide text-charcoal-500 [overflow-wrap:anywhere]">
          {label}
        </span>
        {icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-wood-100 text-primary">
            {icon}
          </span>
        ) : null}
      </span>
      {loading ? (
        <Skeleton className="h-7 w-24 max-w-full" />
      ) : (
        <span className="min-w-0 font-heading text-xl font-bold leading-tight text-charcoal tabular-nums [overflow-wrap:anywhere] sm:text-2xl">
          {value}
        </span>
      )}
      {!loading && hint ? (
        <span className="min-w-0 font-ui text-xs text-charcoal-500 [overflow-wrap:anywhere]">
          {hint}
        </span>
      ) : null}
    </>
  )

  const classes = cn(
    'flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-4 text-left shadow-sm',
    active ? 'border-primary' : 'border-line',
    onClick ? 'transition-colors hover:bg-card-alt' : '',
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active ?? false}
        className={classes}
      >
        {body}
      </button>
    )
  }

  return <div className={classes}>{body}</div>
}
