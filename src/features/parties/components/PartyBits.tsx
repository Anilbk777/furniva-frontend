import { useTranslation } from 'react-i18next'

import { cn } from 'src/lib/cn'

export function PartyAvatar({
  name,
  size = 'sm',
}: {
  name: string
  size?: 'sm' | 'md'
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-pill bg-wood-100 font-ui font-bold text-primary',
        size === 'sm' ? 'size-10 text-sm' : 'size-12 text-base',
      )}
    >
      {initials || '?'}
    </span>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation('parties')
  return (
    <span
      className={cn(
        'rounded-pill px-2 py-0.5 font-ui text-[10px] font-semibold',
        active ? 'bg-pine-100 text-pine-700' : 'bg-charcoal-100 text-charcoal-500',
      )}
    >
      {active ? t('status.active') : t('status.inactive')}
    </span>
  )
}
