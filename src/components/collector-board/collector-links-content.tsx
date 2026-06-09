"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  createCollectionShareAction,
  deleteCollectionShareAction,
  setCollectionShareActiveAction,
  updateCollectionShareProfilesAction,
} from "@/lib/collector-board/actions";
import { buildCollectorPath, buildCollectorUrl } from "@/lib/collector-board/share-link";
import type { CollectionShare } from "@/lib/collector-board/types";
import type { LenderProfile } from "@/lib/lender-profiles/types";
import { useI18n } from "@/lib/i18n/use-i18n";
import { useActionFeedback } from "@/components/ui/action-feedback";

export function CollectorLinksContent({
  error,
  isPreviewMode,
  profiles,
  shares,
}: {
  error?: string;
  isPreviewMode: boolean;
  profiles: LenderProfile[];
  shares: CollectionShare[];
}) {
  const { t } = useI18n();
  const { showFeedback } = useActionFeedback();
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [manualCopyShareId, setManualCopyShareId] = useState<string | null>(null);
  const profileNameById = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile.name])),
    [profiles],
  );
  const canCreate = profiles.length > 0 && !isPreviewMode;

  async function copyShareLink(share: CollectionShare) {
    const url = buildCollectorUrl(window.location.origin, share.token);

    try {
      const copied = await copyTextSafely(url);

      if (!copied) {
        setManualCopyShareId(share.id);
        showFeedback(t("collectorLinks.copyFailed"), "error");
        return;
      }

      setManualCopyShareId(null);
      setCopiedShareId(share.id);
      showFeedback(t("collectorLinks.copySuccess"));
      window.setTimeout(() => setCopiedShareId(null), 2200);
    } catch {
      setManualCopyShareId(share.id);
      showFeedback(t("collectorLinks.copyFailed"), "error");
    }
  }

  return (
    <main className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">{t("collectorLinks.eyebrow")}</p>
          <h2>{t("collectorLinks.title")}</h2>
          <p>{t("collectorLinks.description")}</p>
        </div>
        <Link className="action-button action-button--secondary" href="/settings">
          {t("collectorLinks.backToSettings")}
        </Link>
      </section>

      {error ? <p className="auth-message">{error}</p> : null}

      <section className="panel collector-admin-panel">
        <div className="section-heading">
          <div>
            <h3>{t("collectorLinks.createTitle")}</h3>
            <p>{t("collectorLinks.createDescription")}</p>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="empty-state">
            <h3>{t("common.previewMode")}</h3>
            <p>{t("collectorLinks.previewUnavailable")}</p>
          </div>
        ) : (
          <form action={createCollectionShareAction} className="auth-form auth-form--compact">
            <label className="field">
              <span>{t("collectorLinks.linkName")}</span>
              <input
                autoComplete="off"
                maxLength={80}
                name="name"
                placeholder={t("collectorLinks.namePlaceholder")}
                required
              />
            </label>

            <ProfileCheckboxGrid profiles={profiles} selectedProfileIds={[]} />

            <button className="form-button" disabled={!canCreate} type="submit">
              {t("collectorLinks.createAction")}
            </button>
          </form>
        )}
      </section>

      <section className="collector-share-list" aria-label={t("collectorLinks.savedLinks")}>
        {shares.length === 0 ? (
          <div className="empty-state">
            <h3>{t("collectorLinks.emptyTitle")}</h3>
            <p>{t("collectorLinks.emptyDescription")}</p>
          </div>
        ) : null}

        {shares.map((share) => {
          const sharePath = buildCollectorPath(share.token);
          const shareUrl =
            typeof window === "undefined"
              ? sharePath
              : buildCollectorUrl(window.location.origin, share.token);
          const profileSummary = share.profileIds
            .map((profileId) => profileNameById.get(profileId))
            .filter(Boolean)
            .join(", ");

          return (
            <article
              className="profile-card collector-share-card"
              key={share.id}
            >
              <div className="profile-card__summary">
                <span className="profile-card__avatar" aria-hidden="true">
                  🔗
                </span>
                <span className="profile-card__body">
                  <strong>{share.name}</strong>
                  <small>
                    {share.isActive
                      ? t("collectorLinks.active")
                      : t("collectorLinks.inactive")}
                    {profileSummary ? ` · ${profileSummary}` : ""}
                  </small>
                </span>
              </div>

              <div className="collector-share-url">
                <Link href={sharePath} rel="noreferrer" target="_blank">
                  {sharePath}
                </Link>
                <button
                  className="chip-button"
                  onClick={() => copyShareLink(share)}
                  type="button"
                >
                  {copiedShareId === share.id
                    ? t("collectorLinks.copied")
                    : t("collectorLinks.copy")}
                </button>
              </div>
              {manualCopyShareId === share.id ? (
                <label className="field collector-manual-copy">
                  <span>{t("collectorLinks.manualCopy")}</span>
                  <input
                    onFocus={(event) => event.currentTarget.select()}
                    readOnly
                    value={shareUrl}
                  />
                </label>
              ) : null}

              <form action={updateCollectionShareProfilesAction} className="profile-card__edit">
                <input name="shareId" type="hidden" value={share.id} />
                <ProfileCheckboxGrid
                  profiles={profiles}
                  selectedProfileIds={share.profileIds}
                />
                <button className="form-button form-button--secondary" type="submit">
                  {t("collectorLinks.saveProfiles")}
                </button>
              </form>

              <div className="collector-share-card__actions">
                <form action={setCollectionShareActiveAction}>
                  <input name="shareId" type="hidden" value={share.id} />
                  <input
                    name="isActive"
                    type="hidden"
                    value={share.isActive ? "false" : "true"}
                  />
                  <button className="form-button form-button--secondary" type="submit">
                    {share.isActive
                      ? t("collectorLinks.deactivate")
                      : t("collectorLinks.reactivate")}
                  </button>
                </form>

                <form action={deleteCollectionShareAction}>
                  <input name="shareId" type="hidden" value={share.id} />
                  <button className="form-button form-button--danger" type="submit">
                    {t("collectorLinks.delete")}
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

async function copyTextSafely(text: string) {
  if (
    typeof window !== "undefined" &&
    window.navigator.clipboard?.writeText
  ) {
    try {
      await window.navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback for iOS/PWA/local origins.
    }
  }

  return copyTextWithTextarea(text);
}

function copyTextWithTextarea(text: string) {
  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

function ProfileCheckboxGrid({
  profiles,
  selectedProfileIds,
}: {
  profiles: LenderProfile[];
  selectedProfileIds: string[];
}) {
  const { t } = useI18n();
  const selectedProfileIdSet = new Set(selectedProfileIds);

  if (profiles.length === 0) {
    return (
      <p className="profile-card__hint">{t("collectorLinks.noProfiles")}</p>
    );
  }

  return (
    <fieldset className="collector-profile-picker">
      <legend>{t("collectorLinks.visibleProfiles")}</legend>
      {profiles.map((profile) => (
        <label className="collector-profile-option" key={profile.id}>
          <input
            defaultChecked={selectedProfileIdSet.has(profile.id)}
            name="profileIds"
            type="checkbox"
            value={profile.id}
          />
          <span aria-hidden="true">{profile.avatarEmoji}</span>
          <strong>{profile.name}</strong>
        </label>
      ))}
    </fieldset>
  );
}
