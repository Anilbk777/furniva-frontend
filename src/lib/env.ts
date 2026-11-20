import { z } from 'zod'

const envSchema = z.object({
  VITE_API_ORIGIN: z.string().trim().optional().default(''),
  VITE_API_URL: z.string().min(1).default('/api/v1'),
  VITE_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DEV: z.boolean().optional().default(false),
})

const parsed = envSchema.parse(import.meta.env)

// jsdom enforces CORS on cross-origin XHR, so the test suite keeps the relative path
// that MSW intercepts on the jsdom origin.
const isTest = import.meta.env.MODE === 'test'

function resolveApiBase(origin: string, apiPath: string): string {
  if (!origin || isTest || /^https?:\/\//i.test(apiPath)) return apiPath
  return `${origin.replace(/\/+$/, '')}/${apiPath.replace(/^\/+/, '')}`
}

export const env = {
  ...parsed,
  apiBaseUrl: resolveApiBase(parsed.VITE_API_ORIGIN, parsed.VITE_API_URL),
}
