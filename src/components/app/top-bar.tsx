"use client";

import Link from "next/link";
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
  const activeProfile = lenderProfiles.find(
    (profile) => profile.id === activeLenderProfileId,
  );

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">{t("app.name")}</p>
        <h1>{t("app.title")}</h1>
        {isPreviewMode ? <span className="preview-badge">{t("common.previewMode")}</span> : null}
      </div>
      <div className="top-bar__actions">
        <Link className="profile-switcher" href="/profiles" aria-label="เลือกโปรไฟล์ผู้ปล่อยกู้">
          <span
            className="profile-switcher__avatar"
            data-profile-theme={activeProfile?.themeColor ?? "green"}
            aria-hidden="true"
          >
            {activeProfile?.avatarEmoji ?? "🧑"}
          </span>
          <span>{activeProfile?.name ?? "โปรไฟล์"}</span>
        </Link>
        <a className="profile-button" href="/settings" aria-label={t("nav.settings")}>
          LT
        </a>
      </div>
    </header>
  );
}
