import { useTranslation } from 'react-i18next'
import { Image as ImageIcon } from 'lucide-react'

import {
  handoverTypes,
  orderPriorities,
  orderStatuses,
  type HandoverType,
  type OrderPriority,
  type OrderStatus,
} from 'src/features/orders/types'
import { cn } from 'src/lib/cn'
import { translate } from 'src/lib/i18n'

const statusClass: Record<OrderStatus, string> = {
  new: 'bg-canvas-alt text-charcoal-500',
  in_progress: 'bg-wood-100 text-primary',
  ready: 'bg-pine-50 text-pine-800',
  delivered: 'bg-pine-100 text-pine-700',
  cancelled: 'bg-danger-50 text-danger-800',
}

const priorityClass: Record<OrderPriority, string> = {
  standard: 'bg-canvas-alt text-charcoal-500',
  urgent: 'bg-danger-50 text-danger-800',
  special_order: 'bg-wood-100 text-primary',
}

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation('orders')
  const value = (orderStatuses.includes(status as OrderStatus) ? status : 'new') as OrderStatus
  return (
    <span
      className={cn(
        'whitespace-nowrap rounded-pill px-2 py-0.5 font-ui text-[10px] font-semibold',
        statusClass[value],
      )}
    >
      {translate(t, `orders.statuses.${value}`)}
    </span>
  )
}

export function OrderHandoverBadge({ handover }: { handover: string }) {
  const { t } = useTranslation('orders')
  const value = (
    handoverTypes.includes(handover as HandoverType) ? handover : 'workshop_pickup'
  ) as HandoverType
  return (
    <span className="whitespace-nowrap rounded-pill bg-canvas-alt px-2 py-0.5 font-ui text-[10px] font-semibold text-charcoal-500">
      {translate(t, `orders.handovers.${value}`)}
    </span>
  )
}

/** Tiny square preview used by the list rows; falls back to a neutral placeholder. */
export function OrderCoverPhoto({
  src,
  alt,
  className,
}: {
  src: string | null
  alt: string
  className?: string
}) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-sm border border-line bg-canvas-alt text-charcoal-400',
          className,
        )}
      >
        <ImageIcon className="size-4" />
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('size-10 shrink-0 rounded-sm border border-line object-cover', className)}
    />
  )
}

export function OrderPriorityBadge({ priority }: { priority: string }) {
  const { t } = useTranslation('orders')
  const value = (
    orderPriorities.includes(priority as OrderPriority) ? priority : 'standard'
  ) as OrderPriority
  return (
    <span
      className={cn(
        'whitespace-nowrap rounded-pill px-2 py-0.5 font-ui text-[10px] font-semibold',
        priorityClass[value],
      )}
    >
      {translate(t, `orders.priorities.${value}`)}
    </span>
  )
}
