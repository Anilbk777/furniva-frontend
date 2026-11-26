import { z } from 'zod'

import type { CustomerInput, CustomerType } from 'src/features/customers/types'

function digits(value: string): string {
  return value.replace(/[\s\-()]/g, '')
}

export const customerSchema = z
  .object({
    customer_type: z.string().trim().min(1, 'errors.customerTypeRequired'),
    name: z.string().trim().min(1, 'errors.required').max(150, 'errors.customerNameLength'),
    mobile: z.string().trim().min(1, 'errors.required'),
    alt_phone: z.string().trim(),
    city_area: z
      .string()
      .trim()
      .min(1, 'errors.required')
      .max(100, 'errors.customerAreaLength'),
    landmark: z.string().trim().max(255, 'errors.customerLandmarkLength'),
    opening_balance: z.string().trim(),
    khata_note: z.string().trim().max(500, 'errors.customerNoteLength'),
  })
  .superRefine((values, ctx) => {
    if (!/^\d{10,20}$/.test(digits(values.mobile))) {
      ctx.addIssue({ code: 'custom', path: ['mobile'], message: 'errors.customerMobileInvalid' })
    }
    if (values.alt_phone && !/^\d{10,20}$/.test(digits(values.alt_phone))) {
      ctx.addIssue({
        code: 'custom',
        path: ['alt_phone'],
        message: 'errors.customerMobileInvalid',
      })
    }
    const balance = Number(values.opening_balance || '0')
    if (Number.isNaN(balance) || balance < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['opening_balance'],
        message: 'errors.customerBalanceInvalid',
      })
    }
  })

export type CustomerValues = z.input<typeof customerSchema>

function nullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function toCustomerInput(values: CustomerValues): CustomerInput {
  return {
    customer_type: values.customer_type as CustomerType,
    name: values.name.trim(),
    mobile: digits(values.mobile),
    alt_phone: values.alt_phone ? digits(values.alt_phone) : null,
    city_area: values.city_area.trim(),
    landmark: nullable(values.landmark),
    opening_balance: Number(values.opening_balance || '0'),
    khata_note: nullable(values.khata_note),
  }
}
