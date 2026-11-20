import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LoginForm } from 'src/features/auth/components/LoginForm'
import { server } from 'src/mocks/server'
import { renderWithApp } from 'src/test/renderWithApp'

function renderLogin() {
  return renderWithApp(
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<div>Dashboard screen</div>} />
      <Route path="/change-password" element={<div>Change screen</div>} />
    </Routes>,
    { route: '/login' },
  )
}

describe('LoginForm', () => {
  it('shows invalid credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email or phone number'), 'demo@furniva.local')
    await user.type(screen.getByLabelText('Password'), 'WrongPassword1!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('links to verification when email is not verified', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json(
          {
            success: false,
            status_code: 403,
            message: 'Please verify your email before logging in',
            data: { code: 'EMAIL_NOT_VERIFIED' },
          },
          { status: 403 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email or phone number'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    const link = await screen.findByRole('link', { name: 'Verify your email' })
    expect(link).toHaveAttribute('href', '/verify-email?email=new%40example.com')
  })

  it('navigates to the dashboard on success', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email or phone number'), 'demo@furniva.local')
    await user.type(screen.getByLabelText('Password'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(screen.getByText('Dashboard screen')).toBeInTheDocument()
    })
  })
})
