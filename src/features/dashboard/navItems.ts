import {
  CalendarCheck,
  ContactRound,
  LayoutDashboard,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { paths } from 'src/lib/paths'

export interface NavItem {
  labelKey: string
  path: string
  icon: LucideIcon
  enabled: boolean
}

export const navItems: NavItem[] = [
  {
    labelKey: 'dashboard.nav.dashboard',
    path: paths.dashboard,
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    labelKey: 'dashboard.nav.employees',
    path: paths.employees,
    icon: Users,
    enabled: true,
  },
  {
    labelKey: 'dashboard.nav.attendance',
    path: paths.attendance,
    icon: CalendarCheck,
    enabled: true,
  },
  {
    labelKey: 'dashboard.nav.parties',
    path: paths.parties,
    icon: ContactRound,
    enabled: true,
  },
  {
    labelKey: 'dashboard.nav.organization',
    path: paths.organization,
    icon: Store,
    enabled: true,
  },
]
