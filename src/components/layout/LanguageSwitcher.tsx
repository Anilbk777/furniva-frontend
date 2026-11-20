import { useTranslation } from 'react-i18next'

import { cn } from 'src/lib/cn'
import { syncDocumentLanguage, supportedLanguages } from 'src/lib/i18n'
import { storage } from 'src/lib/storage'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')
  const current = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  function select(language: 'en' | 'ne'): void {
    void i18n.changeLanguage(language).then(() => {
      storage.setLang(language)
      syncDocumentLanguage()
    })
  }

  return (
    <div
      role="group"
      aria-label={t('language')}
      className="inline-flex rounded-sm border border-line bg-card-alt p-0.5"
    >
      {supportedLanguages.map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={current === language}
          onClick={() => select(language)}
          className={cn(
            'min-h-11 rounded-[3px] px-3 font-ui text-xs font-semibold transition-colors',
            current === language ? 'bg-primary text-white' : 'text-charcoal hover:bg-charcoal-100',
          )}
        >
          {language === 'en' ? t('english') : t('nepali')}
        </button>
      ))}
    </div>
  )
}
