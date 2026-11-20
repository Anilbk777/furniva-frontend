import { z } from 'zod'

export const partyTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'errors.required')
    .max(60, 'errors.partyTypeNameLength'),
})

export type PartyTypeValues = z.input<typeof partyTypeSchema>
