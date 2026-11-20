import { useSearchParams } from 'react-router-dom'

import { VerifyEmailForm } from 'src/features/auth/components/VerifyEmailForm'
import { storage } from 'src/lib/storage'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? storage.getPendingEmail() ?? undefined

  return <VerifyEmailForm email={email} />
}
