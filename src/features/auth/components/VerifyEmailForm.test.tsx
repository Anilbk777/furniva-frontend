import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { VerifyEmailForm } from 'src/features/auth/components/VerifyEmailForm'
import { renderWithApp } from 'src/test/renderWithApp'

function renderVerify() {
  return renderWithApp(
    <Routes>
      <Route path="/verify-email" element={<VerifyEmailForm email="new@example.com" />} />
      <Route path="/login" element={<div>Login screen</div>} />
    </Routes>,
    { route: '/verify-email' },
  )
}

async function enterCode(user: ReturnType<typeof userEvent.setup>, code: string): Promise<void> {
  for (const [index, digit] of [...code].entries()) {
    await user.type(screen.getByLabelText(`Digit ${index + 1} of 6`), digit)
  }
}

describe('VerifyEmailForm', () => {
  it('rejects a wrong code and accepts the mock code', async () => {
    const user = userEvent.setup()
    renderVerify()

    await enterCode(user, '000000')
    expect(await screen.findByText('Invalid or expired code')).toBeInTheDocument()

    await enterCode(user, '123456')
    await waitFor(() => {
      expect(screen.getByText('Login screen')).toBeInTheDocument()
    })
  })

  it('asks for the email when none is available', () => {
    renderWithApp(<VerifyEmailForm />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send me a code' })).toBeInTheDocument()
  })
})
