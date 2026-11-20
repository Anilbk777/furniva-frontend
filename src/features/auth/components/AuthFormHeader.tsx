import { useTranslation } from 'react-i18next'

import { BrandMark } from 'src/components/layout/BrandMark'
import { brand } from 'src/lib/brand'

export interface AuthFormHeaderProps {
  title: string
  subtitle?: string
}

export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  const { i18n } = useTranslation()
  const tagline = i18n.resolvedLanguage === 'ne' ? brand.tagline.ne : brand.tagline.en

  return (
    <div className="text-center">
      <BrandMark className="mx-auto w-40" />
      <p className="mt-2 text-sm text-charcoal-500">{tagline}</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-charcoal">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-charcoal-500">{subtitle}</p> : null}
    </div>
  )
}
