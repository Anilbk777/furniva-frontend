import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { navItems } from "src/features/dashboard";
import { cn } from "src/lib/cn";
import { translate } from "src/lib/i18n";

export interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({
  onNavigate,
  collapsed = false,
  className,
}: SidebarProps) {
  const { t } = useTranslation(["dashboard", "common"]);

  return (
    <nav
      aria-label={translate(t, "common.dashboard")}
      className={cn("flex flex-col gap-1", className)}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const label = translate(t, item.labelKey);

        if (!item.enabled) {
          return (
            <div
              key={item.path}
              aria-disabled="true"
              title={collapsed ? label : undefined}
              className="flex min-h-11 items-center gap-3 rounded-sm px-3 text-charcoal-400"
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {!collapsed ? (
                <>
                  <span className="min-w-0 flex-1 font-ui text-sm">
                    {label}
                  </span>
                  <span className="whitespace-nowrap rounded-sm bg-charcoal-100 px-2 py-0.5 font-ui text-[10px] text-charcoal-500">
                    {translate(t, "common.comingSoon")}
                  </span>
                </>
              ) : null}
            </div>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex min-h-11 items-center gap-3 rounded-sm px-3 font-ui text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-charcoal hover:bg-charcoal-100",
              )
            }
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            {!collapsed ? (
              <span className="min-w-0 flex-1">{label}</span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
