import { z } from 'zod'

import type { CustomerType } from 'src/features/customers/types'
import type {
  HandoverType,
  OrderInput,
  OrderPaymentMethod,
  OrderPriority,
} from 'src/features/orders/types'
import { parseBsDate } from 'src/lib/bsCalendar'
import { parseApiTime } from 'src/lib/time'

function digits(value: string): string {
  return value.replace(/[\s\-()]/g, '')
}

export const orderSchema = z
  .object({
    title: z.string().trim().min(1, 'errors.required').max(150, 'errors.orderTitleLength'),
    category: z
      .string()
      .trim()
      .min(1, 'errors.required')
      .max(50, 'errors.orderCategoryLength'),
    description: z.string().trim(),
    hardwood_species: z.string().trim().max(50, 'errors.orderHardwoodLength'),
    total_amount: z.string().trim(),
    advance_amount: z.string().trim(),
    payment_method: z.string().trim(),
    delivery_bs_date: z.string().trim(),
    delivery_time: z.string().trim(),
    priority: z.string().trim().min(1, 'errors.orderPriorityInvalid'),
    handover_type: z.string().trim().min(1, 'errors.orderHandoverInvalid'),
    delivery_address: z.string().trim().max(500, 'errors.orderAddressLength'),
    customer_id: z.string().trim(),
    customer_name: z.string().trim().max(150, 'errors.customerNameLength'),
    customer_type: z.string().trim(),
    customer_mobile: z.string().trim(),
    customer_city_area: z.string().trim().max(100, 'errors.customerAreaLength'),
    customer_landmark: z.string().trim().max(255, 'errors.customerLandmarkLength'),
  })
  .superRefine((values, ctx) => {
    const total = Number(values.total_amount)
    if (!values.total_amount || Number.isNaN(total) || total <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['total_amount'],
        message: 'errors.orderTotalInvalid',
      })
    }

    const advance = Number(values.advance_amount || '0')
    if (Number.isNaN(advance) || advance < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['advance_amount'],
        message: 'errors.orderAdvanceInvalid',
      })
    } else if (!Number.isNaN(total) && advance > total) {
      ctx.addIssue({
        code: 'custom',
        path: ['advance_amount'],
        message: 'errors.orderAdvanceTooHigh',
      })
    }

    if (advance > 0 && !values.payment_method) {
      ctx.addIssue({
        code: 'custom',
        path: ['payment_method'],
        message: 'errors.orderPaymentRequired',
      })
    }

    if (!parseBsDate(values.delivery_bs_date)) {
      ctx.addIssue({
        code: 'custom',
        path: ['delivery_bs_date'],
        message: 'errors.orderBsDateInvalid',
      })
    }

    if (values.delivery_time && !parseApiTime(values.delivery_time)) {
      ctx.addIssue({
        code: 'custom',
        path: ['delivery_time'],
        message: 'errors.orderTimeInvalid',
      })
    }

    if (values.handover_type === 'site_delivery' && !values.delivery_address) {
      ctx.addIssue({
        code: 'custom',
        path: ['delivery_address'],
        message: 'errors.orderAddressRequired',
      })
    }

    if (!values.customer_id) {
      if (!values.customer_name) {
        ctx.addIssue({ code: 'custom', path: ['customer_name'], message: 'errors.required' })
      }
      if (!values.customer_type) {
        ctx.addIssue({
          code: 'custom',
          path: ['customer_type'],
          message: 'errors.customerTypeRequired',
        })
      }
      if (!/^\d{10,20}$/.test(digits(values.customer_mobile))) {
        ctx.addIssue({
          code: 'custom',
          path: ['customer_mobile'],
          message: 'errors.orderCustomerMobileInvalid',
        })
      }
    }
  })

export type OrderValues = z.input<typeof orderSchema>

function nullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

/**
 * Builds the API payload. A linked customer is sent on its own: the backend copies the
 * customer details onto the order, and its PATCH schema rejects null customer fields.
 */
export function toOrderInput(values: OrderValues, photos: string[] = []): OrderInput {
  const customerId = values.customer_id.trim()
  const base: OrderInput = {
    title: values.title.trim(),
    category: values.category.trim(),
    description: nullable(values.description),
    hardwood_species: nullable(values.hardwood_species),
    photos,
    total_amount: Number(values.total_amount),
    advance_amount: Number(values.advance_amount || '0'),
    payment_method: values.payment_method
      ? (values.payment_method as OrderPaymentMethod)
      : null,
    delivery_bs_date: values.delivery_bs_date.trim(),
    delivery_time: values.delivery_time ? values.delivery_time : null,
    priority: values.priority as OrderPriority,
    handover_type: values.handover_type as HandoverType,
    delivery_address: nullable(values.delivery_address),
    customer_id: customerId || null,
  }

  if (customerId) return base

  return {
    ...base,
    customer_name: values.customer_name.trim() || null,
    customer_type: values.customer_type ? (values.customer_type as CustomerType) : null,
    customer_mobile: digits(values.customer_mobile) || null,
    customer_city_area: nullable(values.customer_city_area),
    customer_landmark: nullable(values.customer_landmark),
  }
}
