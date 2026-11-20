import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api/v1'),
  VITE_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DEV: z.boolean().optional().default(false),
})

export const env = envSchema.parse(import.meta.env)
