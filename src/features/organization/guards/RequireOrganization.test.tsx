import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { RequireOrganization } from 'src/features/organization'
import { server } from 'src/mocks/server'
import { renderWithApp } from 'src/test/renderWithApp'
import type { ApiResponse, MeUser, Organization } from 'src/types/api'

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

function mockMe(organization: Organization | null) {
  server.use(
    http.get('/api/v1/auth/me', () =>
      HttpResponse.json<ApiResponse<MeUser>>({
        success: true,
        status_code: 200,
        message: 'ok',
        data: { ...user, organization },
      }),
    ),
  )
}

function renderGuard() {
  return renderWithApp(
    <Routes>
      <Route element={<RequireOrganization />}>
        <Route path="/dashboard" element={<div>Dashboard screen</div>} />
      </Route>
      <Route path="/create-organization" element={<div>Setup screen</div>} />
    </Routes>,
    { route: '/dashboard' },
  )
}

describe('RequireOrganization', () => {
  it('renders protected content for an active organization', async () => {
    mockMe({ id: 'org-1', name: 'Furniva Shop', is_active: true })

    renderGuard()

    expect(await screen.findByText('Dashboard screen')).toBeInTheDocument()
  })

  it('redirects users without an organization to setup', async () => {
    mockMe(null)

    renderGuard()

    expect(await screen.findByText('Setup screen')).toBeInTheDocument()
  })

  it('blocks users with an inactive organization', async () => {
    mockMe({ id: 'org-1', name: 'Furniva Shop', is_active: false })

    renderGuard()

    expect(await screen.findByText('Organization inactive')).toBeInTheDocument()
  })
})
