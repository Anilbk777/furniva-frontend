import { z } from 'zod'

export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'errors.organizationNameRequired')
    .max(120, 'errors.organizationNameLength'),
})

export type OrganizationValues = z.input<typeof organizationSchema>
