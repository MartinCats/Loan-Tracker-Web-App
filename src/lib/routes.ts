export const appRoutes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    labelKey: "nav.dashboard",
    icon: "grid",
  },
  {
    href: "/loans",
    label: "Loans",
    labelKey: "nav.loans",
    icon: "stack",
  },
  {
    href: "/archive",
    label: "Archive",
    labelKey: "nav.archive",
    icon: "box",
  },
  {
    href: "/settings",
    label: "Settings",
    labelKey: "nav.settings",
    icon: "gear",
  },
] as const;

export type AppRoute = (typeof appRoutes)[number];
