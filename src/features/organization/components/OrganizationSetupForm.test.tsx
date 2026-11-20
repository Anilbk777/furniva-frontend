import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { OrganizationSetupForm } from 'src/features/organization/components/OrganizationSetupForm'
import { server } from 'src/mocks/server'
import { renderWithApp } from 'src/test/renderWithApp'

function renderSetup() {
  return renderWithApp(
    <Routes>
      <Route path="/" element={<OrganizationSetupForm />} />
      <Route path="/dashboard" element={<div>Dashboard screen</div>} />
    </Routes>,
  )
}

describe('OrganizationSetupForm', () => {
  it('creates an organization and navigates to the dashboard', async () => {
    server.use(
      http.post('/api/v1/organizations', () =>
        HttpResponse.json(
          {
            success: true,
            status_code: 201,
            message: 'Organization created',
            data: {
              id: 'org-1',
              name: 'Shree Furniture',
              is_active: true,
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            },
          },
          { status: 201 },
        ),
      ),
    )
    const user = userEvent.setup()

    renderSetup()

    await user.type(screen.getByLabelText('Organization name'), 'Shree Furniture')
    await user.click(screen.getByRole('button', { name: 'Create organization' }))

    expect(await screen.findByText('Dashboard screen')).toBeInTheDocument()
  })

  it('shows an error when an organization already exists', async () => {
    server.use(
      http.post('/api/v1/organizations', () =>
        HttpResponse.json(
          {
            success: false,
            status_code: 409,
            message: 'You already have an organization',
            data: null,
          },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()

    renderSetup()

    await user.type(screen.getByLabelText('Organization name'), 'Shree Furniture')
    await user.click(screen.getByRole('button', { name: 'Create organization' }))

    expect(await screen.findByText('You already have an organization')).toBeInTheDocument()
  })
})
