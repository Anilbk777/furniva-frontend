import { z } from 'zod'

import {
  partyPaymentRule,
  type PartyTransactionInput,
} from 'src/features/parties/types'

export const partyTransactionSchema = z
  .object({
    kind: z.enum([
      'credit_sale',
      'credit_purchase',
      'payment_received',
      'payment_made',
      'loan_given',
      'loan_taken',
      'advance_received',
    ]),
    bs_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'errors.bsDateInvalid'),
    amount: z
      .string()
      .trim()
      .refine(
        (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0,
        'errors.amountInvalid',
      ),
    payment_method: z.enum([
      'cash',
      'bank_transfer',
      'esewa',
      'khalti',
      'cheque',
      'other',
      'none',
    ]),
    note: z.string().trim().max(1000, 'errors.noteLength'),
  })
  .superRefine((values, ctx) => {
    const rule = partyPaymentRule[values.kind]
    if (rule === 'required' && values.payment_method === 'none') {
      ctx.addIssue({
        code: 'custom',
        path: ['payment_method'],
        message: 'errors.paymentMethodRequired',
      })
    }
  })

export type PartyTransactionValues = z.input<typeof partyTransactionSchema>

export function toPartyTransactionInput(
  values: PartyTransactionValues,
  partyId: string,
): PartyTransactionInput {
  const rule = partyPaymentRule[values.kind]
  const method = values.payment_method === 'none' ? null : values.payment_method
  return {
    kind: values.kind,
    bs_date: values.bs_date.trim(),
    amount: Number(values.amount),
    // Credit sales/purchases move no money, so they never carry a method.
    payment_method: rule === 'forbidden' ? null : method,
    party_id: partyId,
    note: values.note.trim() || null,
  }
}
