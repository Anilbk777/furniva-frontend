import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { passwordChecks } from 'src/features/auth/schemas/auth.schemas'

export function PasswordChecklist({ value }: { value: string }) {
  const { t } = useTranslation('auth')
  const checks = passwordChecks(value)

  const items = [
    { key: 'length', done: checks.length },
    { key: 'uppercase', done: checks.uppercase },
    { key: 'lowercase', done: checks.lowercase },
    { key: 'digit', done: checks.digit },
    { key: 'special', done: checks.special },
  ] as const

  return (
    <div className="rounded-sm border border-line bg-card-alt p-3">
      <p className="font-ui text-xs font-semibold text-charcoal">
        {t('passwordChecklist.title')}
      </p>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-1.5 font-ui text-xs text-charcoal-500"
          >
            {item.done ? (
              <Check aria-hidden="true" className="size-3.5 text-tertiary" />
            ) : (
              <X aria-hidden="true" className="size-3.5 text-charcoal-400" />
            )}
            {t(`passwordChecklist.${item.key}`)}
          </li>
        ))}
      </ul>
    </div>
  )
}
