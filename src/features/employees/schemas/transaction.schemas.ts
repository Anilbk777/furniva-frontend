import { z } from 'zod'

import type { TransactionInput } from 'src/features/employees/types'

export const transactionSchema = z.object({
  kind: z.enum(['employee_advance', 'employee_salary']),
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
  ]),
  note: z.string().trim().max(1000, 'errors.noteLength'),
})

export type TransactionValues = z.input<typeof transactionSchema>

export function toTransactionInput(
  values: TransactionValues,
  employeeId: string,
): TransactionInput {
  return {
    kind: values.kind,
    bs_date: values.bs_date.trim(),
    amount: Number(values.amount),
    payment_method: values.payment_method,
    employee_id: employeeId,
    note: values.note.trim() || null,
  }
}
