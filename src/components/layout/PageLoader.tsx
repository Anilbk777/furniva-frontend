import { BrandMark } from 'src/components/layout/BrandMark'
import { useTranslation } from 'react-i18next'

export function PageLoader() {
  const { t } = useTranslation('common')
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas"
    >
      <BrandMark />
      <div className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      <span className="font-ui text-sm text-charcoal-500">{t('loading')}</span>
    </div>
  )
}
