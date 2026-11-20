import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { LoginForm } from 'src/features/auth/components/LoginForm'

export function LoginPage() {
  const location = useLocation()
  const { t } = useTranslation('auth')
  const verified = new URLSearchParams(location.search).get('verified') === '1'
  const state = location.state as { email?: string } | null

  return (
    <div className="flex flex-col gap-5">
      {verified ? <Alert variant="success">{t('verifiedBanner')}</Alert> : null}
      <LoginForm initialIdentifier={state?.email ?? ''} />
    </div>
  )
}
