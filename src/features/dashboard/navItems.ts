import {
  CalendarCheck,
  ClipboardList,
  ContactRound,
  LayoutDashboard,
  Store,
  Users,
  UsersRound,
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
    labelKey: 'dashboard.nav.customers',
    path: paths.customers,
    icon: UsersRound,
    enabled: true,
  },
  {
    labelKey: 'dashboard.nav.orders',
    path: paths.orders,
    icon: ClipboardList,
    enabled: true,
  },
  {
    labelKey: 'dashboard.nav.organization',
    path: paths.organization,
    icon: Store,
    enabled: true,
  },
]
