import { useTranslation } from 'react-i18next'

import { AuthFormHeader } from 'src/features/auth'
import { LanguageSwitcher } from 'src/components/layout/LanguageSwitcher'
import { Alert } from 'src/components/ui/Alert'
import { Card } from 'src/components/ui/Card'

export function OrganizationInactive() {
  const { t } = useTranslation('organization')

  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-20 sm:px-6">
        <Card className="w-full p-5 sm:p-8">
          <AuthFormHeader title={t('inactiveTitle')} />
          <Alert variant="info" className="mt-6">
            {t('inactiveMessage')}
          </Alert>
        </Card>
      </div>
    </div>
  )
}
