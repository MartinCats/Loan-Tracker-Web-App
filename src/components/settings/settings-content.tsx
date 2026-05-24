"use client";

import type { signOutAction } from "@/app/auth/actions";
import { PageHeader } from "@/components/ui/page-header";
import { supportedLanguages, type Language } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";

type SettingsContentProps = {
  isPreviewMode: boolean;
  isSupabaseReady: boolean;
  signOut: typeof signOutAction;
};

export function SettingsContent({
  isPreviewMode,
  isSupabaseReady,
  signOut,
}: SettingsContentProps) {
  const { language, setLanguage, t } = useI18n();
  const settings = [
    [t("settings.authentication"), t("settings.authValue")],
    [t("settings.database"), t("settings.databaseValue")],
    [t("settings.pwa"), t("settings.pwaValue")],
    [t("settings.backup"), t("settings.backupValue")],
  ] as const;

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow={t("settings.system")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <section className="panel settings-list">
        <div className="settings-row settings-row--language">
          <span>{t("settings.language")}</span>
          <div className="language-toggle" role="group" aria-label={t("settings.language")}>
            {supportedLanguages.map((option) => (
              <button
                aria-pressed={language === option}
                className={`chip-button${language === option ? " is-active" : ""}`}
                key={option}
                onClick={() => setLanguage(option as Language)}
                type="button"
              >
                {option === "en" ? t("settings.english") : t("settings.thai")}
              </button>
            ))}
          </div>
        </div>

        {settings.map(([label, value]) => (
          <div className="settings-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
        <div className="settings-row">
          <span>{t("settings.previewMode")}</span>
          <strong>{isPreviewMode ? t("settings.enabled") : t("settings.off")}</strong>
        </div>
        <div className="settings-row">
          <span>{t("settings.supabaseEnv")}</span>
          <strong>
            {isSupabaseReady ? t("settings.variablesPresent") : t("settings.notSet")}
          </strong>
        </div>
        {isPreviewMode ? (
          <div className="empty-state">
            <h3>{t("common.previewMode")}</h3>
            <p>{t("settings.previewCopy")}</p>
          </div>
        ) : (
          <form action={signOut} className="settings-action">
            <button className="form-button form-button--secondary" type="submit">
              {t("settings.signOut")}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
