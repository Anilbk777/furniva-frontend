import { z } from 'zod'

import type { PartyInput } from 'src/features/parties/types'

function digits(value: string): string {
  return value.replace(/[\s\-()]/g, '')
}

export const partySchema = z
  .object({
    name: z.string().trim().min(1, 'errors.required').max(120, 'errors.partyNameLength'),
    party_type_id: z.string().trim().min(1, 'errors.partyTypeRequired'),
    phone: z.string().trim().max(20, 'errors.phoneInvalid'),
    address: z.string().trim().max(255, 'errors.addressLength'),
    note: z.string().trim().max(1000, 'errors.noteLength'),
  })
  .superRefine((values, ctx) => {
    if (values.phone && !/^\d{7,15}$/.test(digits(values.phone))) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'errors.phoneInvalid' })
    }
  })

export type PartyValues = z.input<typeof partySchema>

function nullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function toPartyInput(values: PartyValues): PartyInput {
  return {
    name: values.name.trim(),
    party_type_id: values.party_type_id,
    phone: nullable(values.phone),
    address: nullable(values.address),
    note: nullable(values.note),
  }
}
