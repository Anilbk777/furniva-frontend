import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from 'src/components/ui/Skeleton'

export interface DetailPageSkeletonProps {
  /** Number of action-button placeholders shown in the header. */
  actions?: number
  /** Render a round avatar placeholder before the title. */
  avatar?: boolean
  children: ReactNode
}

/**
 * Page-level loading state for a detail screen. The back link, entity header and
 * action buttons are drawn straight away so the real content lands in the same
 * place instead of shifting the layout when it arrives.
 */
export function DetailPageSkeleton({
  actions = 3,
  avatar = true,
  children,
}: DetailPageSkeletonProps) {
  const { t } = useTranslation('common')

  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span role="status" className="sr-only">
        {t('loading')}
      </span>
      <Skeleton className="h-5 w-36" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {avatar ? <Skeleton className="size-12 shrink-0 rounded-pill" /> : null}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-52 max-w-full" />
            <Skeleton className="h-4 w-36 max-w-full" />
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:flex-wrap">
          {Array.from({ length: actions }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-sm lg:w-28" />
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

/** Placeholder for a label/value grid inside a detail card. */
export function SkeletonFields({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder rows for a table or record list inside a detail card. */
export function SkeletonTableRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12" />
      ))}
    </div>
  )
}
