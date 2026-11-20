import { useTranslation } from 'react-i18next'

import { PageLoader } from 'src/components/layout/PageLoader'
import { Alert } from 'src/components/ui/Alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'src/components/ui/Card'
import { OrganizationSettingsForm } from 'src/features/organization/components/OrganizationSettingsForm'
import { useOrganization } from 'src/features/organization/hooks/useOrganization'
import { formatDate } from 'src/lib/format'

export function OrganizationPage() {
  const organization = useOrganization()
  const { t, i18n } = useTranslation('organization')
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  if (organization.isLoading) return <PageLoader />

  if (organization.isError || !organization.data) {
    return <Alert variant="error">{t('loadError')}</Alert>
  }

  const data = organization.data

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-charcoal">
          {t('updateTitle')}
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">{t('updateSubtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>{t('updateTitle')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">{t('status')}</span>
            <span className="font-medium">
              {data.is_active ? t('active') : t('inactive')}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">{t('createdAt')}</span>
            <span className="font-medium">{formatDate(data.created_at, language)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">{t('updatedAt')}</span>
            <span className="font-medium">
              {data.updated_at ? formatDate(data.updated_at, language) : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm initialName={data.name} />
        </CardContent>
      </Card>
    </div>
  )
}
