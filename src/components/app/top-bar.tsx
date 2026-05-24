"use client";

import { useI18n } from "@/lib/i18n/use-i18n";

export function TopBar({ isPreviewMode = false }: { isPreviewMode?: boolean }) {
  const { t } = useI18n();

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">{t("app.name")}</p>
        <h1>{t("app.title")}</h1>
        {isPreviewMode ? <span className="preview-badge">{t("common.previewMode")}</span> : null}
      </div>
      <a className="profile-button" href="/settings" aria-label={t("nav.settings")}>
        LT
      </a>
    </header>
  );
}
