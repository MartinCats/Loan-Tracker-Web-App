"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/lib/routes";
import { cn } from "@/lib/cn";

function RouteIcon({ icon }: { icon: (typeof appRoutes)[number]["icon"] }) {
  return <span aria-hidden="true" className={`nav-icon nav-icon--${icon}`} />;
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {appRoutes.map((route) => {
        const isActive =
          pathname === route.href ||
          (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));

        return (
          <Link
            className={cn("bottom-nav__item", isActive && "is-active")}
            href={route.href}
            key={route.href}
            aria-current={isActive ? "page" : undefined}
          >
            <RouteIcon icon={route.icon} />
            <span>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
