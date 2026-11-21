import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, LogOut, MonitorOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useMe, useLogout, useLogoutAll } from 'src/features/auth'
import { ConfirmDialog } from 'src/components/ui/ConfirmDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/DropdownMenu'
import { translate } from 'src/lib/i18n'
import { paths } from 'src/lib/paths'

export function UserMenu() {
  const { data: me } = useMe()
  const logout = useLogout()
  const logoutAll = useLogoutAll()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t } = useTranslation(['dashboard', 'auth', 'common'])

  const roleText = me ? translate(t, `dashboard.roles.${me.role}`) : ''
  const roleLabel = roleText.startsWith('dashboard.roles.') ? (me?.role ?? '') : roleText

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={translate(t, 'dashboard.userMenu')}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-sm px-2 hover:bg-charcoal-100"
          >
            <span className="grid size-8 place-items-center rounded-pill bg-primary font-ui text-sm font-bold text-white">
              {me?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
            <span className="hidden max-w-32 truncate font-ui text-sm font-medium sm:block">
              {me?.name ?? ''}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <span className="block font-semibold text-charcoal">{me?.name}</span>
            <span className="block font-normal">{me?.email}</span>
            <span className="block font-normal">{roleLabel}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={paths.changePassword}>
              <KeyRound aria-hidden="true" className="size-4" />
              {translate(t, 'auth.changePassword')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setConfirmOpen(true)}>
            <MonitorOff aria-hidden="true" className="size-4" />
            {translate(t, 'auth.signOutAll')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => logout.mutate()}>
            <LogOut aria-hidden="true" className="size-4" />
            {translate(t, 'common.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={translate(t, 'auth.signOutAll')}
        description={translate(t, 'auth.signOutAllConfirm')}
        confirmLabel={translate(t, 'common.confirm')}
        cancelLabel={translate(t, 'common.cancel')}
        pending={logoutAll.isPending}
        onConfirm={() => {
          logoutAll.mutate()
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
