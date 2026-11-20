import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { OrganizationPage } from 'src/features/organization/pages/OrganizationPage'
import { server } from 'src/mocks/server'
import { renderWithApp } from 'src/test/renderWithApp'

const createdAt = '2026-01-01T00:00:00Z'

describe('OrganizationPage', () => {
  it('loads and updates the organization name', async () => {
    server.use(
      http.get('/api/v1/organizations', () =>
        HttpResponse.json({
          success: true,
          status_code: 200,
          message: 'Organization fetched',
          data: {
            id: 'org-1',
            name: 'Old Furniture',
            is_active: true,
            created_at: createdAt,
            updated_at: createdAt,
          },
        }),
      ),
      http.patch('/api/v1/organizations', async ({ request }) => {
        const body = (await request.json()) as { name: string }
        return HttpResponse.json({
          success: true,
          status_code: 200,
          message: 'Organization updated',
          data: {
            id: 'org-1',
            name: body.name,
            is_active: true,
            created_at: createdAt,
            updated_at: createdAt,
          },
        })
      }),
    )
    const user = userEvent.setup()

    renderWithApp(<OrganizationPage />, { route: '/organization' })

    expect(await screen.findByText('Old Furniture')).toBeInTheDocument()
    const input = screen.getByLabelText('Organization name')
    await user.clear(input)
    await user.type(input, 'New Furniture')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('New Furniture')).toBeInTheDocument()
  })
})
