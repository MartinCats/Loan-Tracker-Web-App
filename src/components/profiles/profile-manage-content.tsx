"use client";

import Link from "next/link";
import {
  deleteLenderProfileFormAction,
  updateLenderProfileFormAction,
} from "@/lib/lender-profiles/actions";
import { ProfileIdentityControls } from "@/components/profiles/profile-identity-controls";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { LenderProfile } from "@/lib/lender-profiles/types";

export function ProfileManageContent({
  error,
  profiles,
}: {
  error?: string;
  profiles: LenderProfile[];
}) {
  const { t } = useI18n();

  return (
    <main className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">{t("profiles.eyebrow")}</p>
          <h2>{t("profiles.manageTitle")}</h2>
          <p>{t("profiles.manageDescription")}</p>
        </div>
        <Link className="action-button action-button--secondary" href="/profiles">
          {t("profiles.backToProfiles")}
        </Link>
      </section>

      {error ? <p className="auth-message">{error}</p> : null}

      <section className="profile-grid" aria-label={t("profiles.manageTitle")}>
        {profiles.map((profile) => {
          const canDelete = profiles.length > 1;

          return (
            <article
              className="profile-card"
              data-profile-theme={profile.themeColor}
              key={profile.id}
            >
              <div className="profile-card__summary">
                <span className="profile-card__avatar" data-profile-theme={profile.themeColor} aria-hidden="true">
                  {profile.avatarEmoji}
                </span>
                <span className="profile-card__body">
                  <strong>{profile.name}</strong>
                  <small>{t("profiles.manage")}</small>
                </span>
              </div>

              <form action={updateLenderProfileFormAction} className="profile-card__edit">
                <input name="profileId" type="hidden" value={profile.id} />
                <input name="returnTo" type="hidden" value="/profiles/manage" />
                <label className="field">
                  <span>{t("profiles.editName")}</span>
                  <input
                    autoComplete="off"
                    defaultValue={profile.name}
                    maxLength={80}
                    name="name"
                    required
                  />
                </label>
                <ProfileIdentityControls
                  avatarEmoji={profile.avatarEmoji}
                  themeColor={profile.themeColor}
                />
                <button className="form-button form-button--secondary" type="submit">
                  {t("profiles.save")}
                </button>
              </form>

              <form action={deleteLenderProfileFormAction}>
                <input name="profileId" type="hidden" value={profile.id} />
                <input name="returnTo" type="hidden" value="/profiles/manage" />
                <button
                  className="form-button form-button--danger"
                  disabled={!canDelete}
                  type="submit"
                >
                  {t("profiles.delete")}
                </button>
              </form>

              {!canDelete ? (
                <p className="profile-card__hint">{t("profiles.lastProfileHint")}</p>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
