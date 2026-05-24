"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { appRoutes } from "@/lib/routes";
import { cn } from "@/lib/cn";

function RouteIcon({ icon }: { icon: (typeof appRoutes)[number]["icon"] }) {
  return <span aria-hidden="true" className={`nav-icon nav-icon--${icon}`} />;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      appRoutes.forEach((route) => router.prefetch(route.href));
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {appRoutes.map((route) => {
        const isActive =
          pathname === route.href ||
          (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));
        const isPending = pendingHref === route.href && !isActive;

        return (
          <Link
            aria-busy={isPending ? "true" : undefined}
            className={cn(
              "bottom-nav__item",
              isActive && "is-active",
              isPending && "is-pending",
            )}
            href={route.href}
            key={route.href}
            prefetch
            onClick={() => {
              if (!isActive) {
                setPendingHref(route.href);
              }
            }}
            onFocus={() => router.prefetch(route.href)}
            onMouseEnter={() => router.prefetch(route.href)}
            onPointerDown={(event) => {
              if (event.button === 0 && !isActive) {
                setPendingHref(route.href);
              }
            }}
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
