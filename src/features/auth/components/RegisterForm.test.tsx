import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { RegisterForm } from 'src/features/auth/components/RegisterForm'
import { renderWithApp } from 'src/test/renderWithApp'
import { server } from 'src/mocks/server'

describe('RegisterForm', () => {
  it('submits normalized data and reports success', async () => {
    let body: unknown
    server.use(
      http.post('/api/v1/auth/register', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          { success: true, status_code: 201, message: 'Created', data: null },
          { status: 201 },
        )
      }),
    )
    const onSuccess = vi.fn()
    const user = userEvent.setup()

    renderWithApp(<RegisterForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('Full name'), 'Demo User')
    await user.type(screen.getByLabelText('Phone number'), '9841234567')
    await user.type(screen.getByLabelText('Email'), ' USER@Example.COM ')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'Password1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('user@example.com')
    })
    expect(body).toEqual({
      name: 'Demo User',
      phone: '9841234567',
      email: 'user@example.com',
      password: 'Password1!',
    })
  })

  it('shows a server conflict under the matching field', async () => {
    server.use(
      http.post('/api/v1/auth/register', () =>
        HttpResponse.json(
          {
            success: false,
            status_code: 409,
            message: 'A user with this email already exists',
            data: null,
          },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()

    renderWithApp(<RegisterForm />)

    await user.type(screen.getByLabelText('Full name'), 'Demo User')
    await user.type(screen.getByLabelText('Phone number'), '9841234567')
    await user.type(screen.getByLabelText('Email'), 'taken@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'Password1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findAllByText('A user with this email already exists')).toHaveLength(2)
  })
})
