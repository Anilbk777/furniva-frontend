import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from 'src/components/ui/DropdownMenu'
import { syncDocumentLanguage, supportedLanguages } from 'src/lib/i18n'
import { storage } from 'src/lib/storage'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')
  const current = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  function select(language: 'en' | 'ne'): void {
    if (language === current) return
    void i18n.changeLanguage(language).then(() => {
      storage.setLang(language)
      syncDocumentLanguage()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('language')}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border border-line bg-card-alt px-2.5 font-ui text-xs font-semibold text-charcoal transition-colors hover:bg-charcoal-100 sm:px-3"
        >
          <Globe aria-hidden="true" className="size-4 text-charcoal-500" />
          <span className="sm:hidden">{current === 'en' ? 'EN' : 'ने'}</span>
          <span className="hidden sm:inline">
            {current === 'en' ? t('english') : t('nepali')}
          </span>
          <ChevronDown aria-hidden="true" className="size-3.5 text-charcoal-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(value) => select(value as 'en' | 'ne')}
        >
          {supportedLanguages.map((language) => (
            <DropdownMenuRadioItem key={language} value={language}>
              {language === 'en' ? t('english') : t('nepali')}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
