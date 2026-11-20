import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { RegisterForm } from 'src/features/auth/components/RegisterForm'
import { paths } from 'src/lib/paths'

export function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return (
    <RegisterForm
      onSuccess={(email) => {
        toast.success(t('registerSuccess'))
        navigate(`${paths.verifyEmail}?email=${encodeURIComponent(email)}`, { replace: true })
      }}
    />
  )
}
