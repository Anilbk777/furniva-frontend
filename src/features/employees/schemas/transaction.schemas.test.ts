import { describe, expect, it } from 'vitest'

import {
  toTransactionInput,
  transactionSchema,
} from 'src/features/employees/schemas/transaction.schemas'

const valid = {
  kind: 'employee_advance' as const,
  bs_date: '2083-08-03',
  amount: '1500.50',
  payment_method: 'cash' as const,
  note: 'Dashain advance',
}

describe('transactionSchema', () => {
  it('accepts a valid employee payment', () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a zero or malformed amount', () => {
    expect(transactionSchema.safeParse({ ...valid, amount: '0' }).success).toBe(false)
    expect(transactionSchema.safeParse({ ...valid, amount: '-5' }).success).toBe(false)
    expect(transactionSchema.safeParse({ ...valid, amount: '12.345' }).success).toBe(false)
  })

  it('rejects a malformed BS date', () => {
    expect(transactionSchema.safeParse({ ...valid, bs_date: '83-8-3' }).success).toBe(false)
  })

  it('rejects too long notes', () => {
    expect(
      transactionSchema.safeParse({ ...valid, note: 'x'.repeat(1001) }).success,
    ).toBe(false)
  })

  it('maps form values to the API payload', () => {
    expect(toTransactionInput(valid, 'employee-1')).toEqual({
      kind: 'employee_advance',
      bs_date: '2083-08-03',
      amount: 1500.5,
      payment_method: 'cash',
      employee_id: 'employee-1',
      note: 'Dashain advance',
    })
  })

  it('sends an empty note as null', () => {
    expect(toTransactionInput({ ...valid, note: '   ' }, 'employee-1').note).toBeNull()
  })
})
