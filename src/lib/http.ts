import axios, { type InternalAxiosRequestConfig } from 'axios'

import { env } from 'src/lib/env'
import { clearSessionCache } from 'src/lib/queryClient'

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  timeout:30000,
  headers: { 'Content-Type': 'application/json' },
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const publicPaths = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
])

let refreshInFlight: Promise<void> | null = null
let redirectHandler: (to: string) => void = (to) => {
  window.location.assign(to)
}

export function setSessionRedirectHandler(handler: (to: string) => void): void {
  redirectHandler = handler
}

function pathOf(config: InternalAxiosRequestConfig): string {
  return (config.url ?? '').split('?')[0] ?? ''
}

function runRefresh(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = http
      .post('/auth/refresh')
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error)

    const config = error.config as RetryConfig
    const status = error.response?.status
    const path = pathOf(config)
    const errorData = error.response?.data as { data?: { code?: string } } | undefined

    if (status === 403 && errorData?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
      redirectHandler('/change-password')
      return Promise.reject(error)
    }

    if (status !== 401 || config._retry || publicPaths.has(path)) {
      return Promise.reject(error)
    }

    config._retry = true
    try {
      await runRefresh()
      return await http.request(config)
    } catch {
      clearSessionCache()
      const next = `${window.location.pathname}${window.location.search}`
      redirectHandler(`/login?next=${encodeURIComponent(next)}`)
      return Promise.reject(error)
    }
  },
)
