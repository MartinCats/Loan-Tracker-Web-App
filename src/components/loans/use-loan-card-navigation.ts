"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export function useLoanCardNavigation(detailHref: string) {
  const pathname = usePathname();
  const router = useRouter();
  const openingTimer = useRef<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    router.prefetch(detailHref);
  }, [detailHref, router]);

  useEffect(() => {
    setIsOpening(false);
    setIsPressed(false);

    if (openingTimer.current) {
      window.clearTimeout(openingTimer.current);
      openingTimer.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (openingTimer.current) {
        window.clearTimeout(openingTimer.current);
      }
    };
  }, []);

  function beginOpeningFeedback() {
    if (openingTimer.current) {
      window.clearTimeout(openingTimer.current);
    }

    openingTimer.current = window.setTimeout(() => {
      setIsOpening(true);
    }, 150);
  }

  return {
    isOpening,
    isPressed,
    linkProps: {
      "aria-busy": isOpening || undefined,
      onClick: (_event: MouseEvent<HTMLAnchorElement>) => beginOpeningFeedback(),
      onFocus: (_event: FocusEvent<HTMLAnchorElement>) => router.prefetch(detailHref),
      onMouseEnter: (_event: MouseEvent<HTMLAnchorElement>) => router.prefetch(detailHref),
      onPointerCancel: (_event: PointerEvent<HTMLAnchorElement>) => setIsPressed(false),
      onPointerDown: (event: PointerEvent<HTMLAnchorElement>) => {
        if (event.button === 0) {
          setIsPressed(true);
        }
      },
      onPointerLeave: (_event: PointerEvent<HTMLAnchorElement>) => setIsPressed(false),
      onPointerUp: (_event: PointerEvent<HTMLAnchorElement>) => setIsPressed(false),
      prefetch: true,
    },
  };
}
