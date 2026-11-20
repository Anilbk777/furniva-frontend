import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BrandMark } from 'src/components/layout/BrandMark'
import { Sidebar } from 'src/components/layout/Sidebar'
import { Topbar } from 'src/components/layout/Topbar'
import { IconButton } from 'src/components/ui/IconButton'
import { Sheet, SheetContent } from 'src/components/ui/Sheet'
import { navItems } from 'src/features/dashboard'
import { brand } from 'src/lib/brand'
import { translate } from 'src/lib/i18n'
import { cn } from 'src/lib/cn'

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation(['dashboard', 'common'])
  const { pathname } = useLocation()
  const activeNavItem = navItems.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )
  const title = activeNavItem
    ? translate(t, activeNavItem.labelKey)
    : translate(t, 'dashboard.nav.dashboard')

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-line bg-card lg:flex',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="flex items-center justify-between gap-2 p-4">
          {!collapsed ? <BrandMark /> : null}
          <IconButton
            label={collapsed ? translate(t, 'dashboard.openMenu') : translate(t, 'dashboard.closeMenu')}
            variant="outlined"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </IconButton>
        </div>
        <Sidebar collapsed={collapsed} className="px-3 pb-4" />
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setDrawerOpen(true)} title={title} />
          <main className="flex-1 px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
        <SheetContent
          title={brand.name}
          closeLabel={translate(t, 'common.close')}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} className="px-1" />
        </SheetContent>
      </Sheet>
    </div>
  )
}
