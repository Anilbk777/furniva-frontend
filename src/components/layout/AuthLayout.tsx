import { Outlet } from 'react-router-dom'

import { LanguageSwitcher } from 'src/components/layout/LanguageSwitcher'
import { Card } from 'src/components/ui/Card'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-20 sm:px-6">
        <Card className="w-full p-5 sm:p-8">
          <Outlet />
        </Card>
      </div>
    </div>
  )
}
