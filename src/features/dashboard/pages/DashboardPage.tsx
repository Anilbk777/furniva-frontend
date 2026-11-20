import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'src/components/ui/Card'
import { Skeleton } from 'src/components/ui/Skeleton'
import { navItems } from 'src/features/dashboard/navItems'
import { useMe } from 'src/features/auth'
import { formatDate } from 'src/lib/format'
import { translate } from 'src/lib/i18n'

export function DashboardPage() {
  const { data: me, isLoading } = useMe()
  const { t, i18n } = useTranslation(['dashboard', 'common'])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32 sm:col-span-2" />
      </div>
    )
  }

  if (!me) return null

  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const disabledItems = navItems.filter((item) => !item.enabled)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-charcoal">
          {t('dashboard:welcome', { name: me.name })}
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">{t('dashboard:stats')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard:account')}</CardTitle>
            <CardDescription>{me.email}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {me.organization?.name ? (
              <div className="flex justify-between gap-4">
                <span className="text-charcoal-500">{t('dashboard:organization')}</span>
                <span className="font-medium">{me.organization.name}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <span className="text-charcoal-500">{t('dashboard:role')}</span>
              <span className="font-medium">
                {translate(t, `dashboard.roles.${me.role}`)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-charcoal-500">{t('dashboard:emailVerified')}</span>
              <span className="font-medium">
                {me.email_verified_at
                  ? t('dashboard:verifiedOn', {
                      date: formatDate(me.email_verified_at, language),
                    })
                  : t('dashboard:notVerified')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('common:dashboard')}</CardTitle>
            <CardDescription>{t('dashboard:stats')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {['statEmployees', 'statParties', 'statTransactions', 'statRevenue'].map((key) => (
              <div key={key} className="rounded-sm bg-canvas-alt p-3">
                <span className="block text-charcoal-500">
                  {translate(t, `dashboard.${key}`)}
                </span>
                <span className="mt-1 block font-heading text-xl font-bold">—</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>{t('common:comingSoon')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {disabledItems.map((item) => (
              <span
                key={item.path}
                className="rounded-pill bg-canvas-alt px-3 py-1 font-ui text-sm text-charcoal-500"
              >
                {translate(t, item.labelKey)}
              </span>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
