"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LenderProfile } from "@/lib/lender-profiles/types";
import { useI18n } from "@/lib/i18n/use-i18n";

export function TopBar({
  activeLenderProfileId,
  isPreviewMode = false,
  lenderProfiles = [],
}: {
  activeLenderProfileId?: string;
  isPreviewMode?: boolean;
  lenderProfiles?: LenderProfile[];
}) {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeProfile = lenderProfiles.find(
    (profile) => profile.id === activeLenderProfileId,
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen]);

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">{t("app.name")}</p>
        <h1>{t("app.title")}</h1>
        {isPreviewMode ? <span className="preview-badge">{t("common.previewMode")}</span> : null}
      </div>
      <div className="profile-menu" ref={menuRef}>
        <button
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label={t("profiles.menu.open")}
          className="profile-switcher"
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span
            className="profile-switcher__avatar"
            data-profile-theme={activeProfile?.themeColor ?? "green"}
            aria-hidden="true"
          >
            {activeProfile?.avatarEmoji ?? "👦🏻"}
          </span>
          <span>{activeProfile?.name ?? t("profiles.mainFallback")}</span>
        </button>

        {isMenuOpen ? (
          <div className="profile-menu__panel" role="menu">
            <Link href="/profiles" role="menuitem" onClick={() => setIsMenuOpen(false)}>
              {t("profiles.menu.switch")}
            </Link>
            <Link href="/profiles/manage" role="menuitem" onClick={() => setIsMenuOpen(false)}>
              {t("profiles.menu.manage")}
            </Link>
            <Link href="/settings" role="menuitem" onClick={() => setIsMenuOpen(false)}>
              {t("profiles.menu.settings")}
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
