import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { RequireAuth } from 'src/features/auth'
import { server } from 'src/mocks/server'
import { renderWithApp } from 'src/test/renderWithApp'
import type { ApiResponse, MeUser } from 'src/types/api'

function renderProtected() {
  return renderWithApp(
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<div>Protected screen</div>} />
      </Route>
      <Route path="/login" element={<div>Login screen</div>} />
    </Routes>,
    { route: '/dashboard' },
  )
}

describe('RequireAuth', () => {
  it('redirects unauthenticated users to login with a next path', async () => {
    renderProtected()

    await waitFor(() => {
      expect(screen.getByText('Login screen')).toBeInTheDocument()
    })
  })

  it('renders protected content for authenticated users', async () => {
    const user: MeUser = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Demo User',
      phone: '9841234567',
      email: 'demo@furniva.local',
      role: 'owner',
      is_active: true,
      must_change_password: false,
      email_verified_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: null,
      organization: null,
    }
    server.use(
      http.get('/api/v1/auth/me', () =>
        HttpResponse.json<ApiResponse<MeUser>>({
          success: true,
          status_code: 200,
          message: 'ok',
          data: user,
        }),
      ),
    )

    renderProtected()

    expect(await screen.findByText('Protected screen')).toBeInTheDocument()
  })
})
