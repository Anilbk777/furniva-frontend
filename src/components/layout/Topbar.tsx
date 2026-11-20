import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from 'src/components/layout/LanguageSwitcher'
import { UserMenu } from 'src/components/layout/UserMenu'
import { IconButton } from 'src/components/ui/IconButton'
import { translate } from 'src/lib/i18n'

export interface TopbarProps {
  onMenuClick: () => void
  title: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { t } = useTranslation(['dashboard', 'common'])

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-line bg-card px-4 pt-[env(safe-area-inset-top)] sm:px-6">
      <IconButton
        label={translate(t, 'dashboard.openMenu')}
        variant="outlined"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu aria-hidden="true" className="size-5" />
      </IconButton>
      <h1 className="min-w-0 flex-1 font-heading text-lg font-bold text-charcoal">{title}</h1>
      <LanguageSwitcher />
      <UserMenu />
    </header>
  )
}
