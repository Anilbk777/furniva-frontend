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
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading = false,
  active,
  onClick,
}: StatCardProps) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="font-ui text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">
          {label}
        </span>
        {icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-wood-100 text-primary">
            {icon}
          </span>
        ) : null}
      </span>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <span className="font-heading text-2xl font-bold leading-none text-charcoal">
          {value}
        </span>
      )}
      {!loading && hint ? (
        <span className="font-ui text-xs text-charcoal-500">{hint}</span>
      ) : null}
    </>
  )

  const classes = cn(
    'flex flex-col gap-2 rounded-lg border bg-card p-4 text-left shadow-sm',
    active ? 'border-primary' : 'border-line',
    onClick ? 'transition-colors hover:bg-card-alt' : '',
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
