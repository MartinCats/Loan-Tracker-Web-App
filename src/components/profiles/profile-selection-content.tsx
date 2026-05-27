"use client";

import Link from "next/link";
import {
  createLenderProfileFormAction,
  selectLenderProfileAction,
} from "@/lib/lender-profiles/actions";
import {
  defaultLenderProfileAvatar,
  defaultLenderProfileThemeColor,
  lenderProfileAvatarOptions,
  suggestedLenderProfilePresets,
} from "@/lib/lender-profiles/identity";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { LenderProfile } from "@/lib/lender-profiles/types";

export function ProfileSelectionContent({
  activeProfile,
  error,
  profiles,
}: {
  activeProfile: LenderProfile | null;
  error?: string;
  profiles: LenderProfile[];
}) {
  const { t } = useI18n();
  const hasCustomProfiles = profiles.length > 1;

  return (
    <main className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">{t("profiles.eyebrow")}</p>
          <h2>{t("profiles.title")}</h2>
          <p>{t("profiles.description")}</p>
        </div>
        <Link className="action-button action-button--secondary" href="/profiles/manage">
          {t("profiles.manage")}
        </Link>
      </section>

      <details className="panel profile-add-details">
        <summary>{t("profiles.addDetails")}</summary>
        <p>{t("profiles.addDescription")}</p>

        <div className="profile-template-stack">
          <div className="section-heading">
            <div>
              <h2>{t("profiles.presetsTitle")}</h2>
              <p>{t("profiles.presetsDescription")}</p>
            </div>
          </div>

          <div className="profile-preset-grid">
            {suggestedLenderProfilePresets.map((preset) => {
              const label = t(preset.labelKey as Parameters<typeof t>[0]);

              return (
                <form action={createLenderProfileFormAction} key={preset.labelKey}>
                  <input name="name" type="hidden" value={label} />
                  <input name="avatarEmoji" type="hidden" value={preset.avatarEmoji} />
                  <input name="themeColor" type="hidden" value={preset.themeColor} />
                  <button
                    className="profile-preset-button"
                    data-profile-theme={preset.themeColor}
                    type="submit"
                  >
                    <span aria-hidden="true">{preset.avatarEmoji}</span>
                    <strong>{label}</strong>
                  </button>
                </form>
              );
            })}
          </div>
        </div>

        <form action={createLenderProfileFormAction} className="auth-form auth-form--compact">
          <label className="field">
            <span>{t("profiles.name")}</span>
            <input
              autoComplete="off"
              name="name"
              placeholder={t("profiles.namePlaceholder")}
              required
              maxLength={80}
            />
          </label>
          <div className="profile-option-group profile-option-group--compact">
            <span>{t("profiles.avatar")}</span>
            <div className="profile-option-row" role="radiogroup" aria-label={t("profiles.avatar")}>
              {lenderProfileAvatarOptions.map((emoji) => (
                <label className="profile-avatar-option" key={emoji}>
                  <input
                    defaultChecked={emoji === defaultLenderProfileAvatar}
                    name="avatarEmoji"
                    type="radio"
                    value={emoji}
                  />
                  <span aria-hidden="true">{emoji}</span>
                </label>
              ))}
            </div>
          </div>
          <input name="themeColor" type="hidden" value={defaultLenderProfileThemeColor} />
          <button className="form-button" type="submit">
            {t("profiles.create")}
          </button>
        </form>
        {error ? <p className="inline-status is-error">{error}</p> : null}
      </details>

      <section className="profile-grid" aria-label={t("profiles.listLabel")}>
        {!hasCustomProfiles ? (
          <div className="empty-state profile-empty-state" data-profile-theme={activeProfile?.themeColor ?? "green"}>
            <div className="empty-profile-identity">
              <span aria-hidden="true">{activeProfile?.avatarEmoji ?? defaultLenderProfileAvatar}</span>
              <strong>{activeProfile?.name ?? t("profiles.mainFallback")}</strong>
            </div>
            <h3>{t("profiles.emptyTitle")}</h3>
            <p>{t("profiles.emptyDescription")}</p>
          </div>
        ) : null}

        {profiles.map((profile) => {
          const isActive = activeProfile?.id === profile.id;

          return (
            <form action={selectLenderProfileAction} key={profile.id}>
              <input name="profileId" type="hidden" value={profile.id} />
              <button
                className={`profile-card profile-card--select ${isActive ? "is-active" : ""}`}
                data-profile-theme={profile.themeColor}
                type="submit"
              >
                <span className="profile-card__avatar" data-profile-theme={profile.themeColor} aria-hidden="true">
                  {profile.avatarEmoji}
                </span>
                <span className="profile-card__body">
                  <strong>{profile.name}</strong>
                  <small>{isActive ? t("profiles.active") : t("profiles.select")}</small>
                </span>
              </button>
            </form>
          );
        })}
      </section>
    </main>
  );
}
