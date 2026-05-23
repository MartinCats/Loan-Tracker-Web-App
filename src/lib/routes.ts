export const appRoutes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "grid",
  },
  {
    href: "/loans",
    label: "Loans",
    icon: "stack",
  },
  {
    href: "/archive",
    label: "Archive",
    icon: "box",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "gear",
  },
] as const;

export type AppRoute = (typeof appRoutes)[number];
