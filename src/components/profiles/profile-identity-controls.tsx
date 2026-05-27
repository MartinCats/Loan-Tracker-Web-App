"use client";

import {
  defaultLenderProfileAvatar,
  defaultLenderProfileThemeColor,
  lenderProfileAvatarOptions,
  lenderProfileThemeColors,
} from "@/lib/lender-profiles/identity";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { LenderProfileThemeColor } from "@/lib/lender-profiles/types";

export function ProfileIdentityControls({
  avatarEmoji = defaultLenderProfileAvatar,
  themeColor = defaultLenderProfileThemeColor,
}: {
  avatarEmoji?: string;
  themeColor?: LenderProfileThemeColor | string;
}) {
  const { t } = useI18n();

  return (
    <div className="profile-identity-grid">
      <div className="profile-option-group">
        <span>{t("profiles.avatar")}</span>
        <div className="profile-option-row" role="radiogroup" aria-label={t("profiles.avatar")}>
          {lenderProfileAvatarOptions.map((emoji) => (
            <label className="profile-avatar-option" key={emoji}>
              <input
                defaultChecked={emoji === avatarEmoji}
                name="avatarEmoji"
                type="radio"
                value={emoji}
              />
              <span aria-hidden="true">{emoji}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="profile-option-group">
        <span>{t("profiles.color")}</span>
        <div className="profile-option-row" role="radiogroup" aria-label={t("profiles.color")}>
          {lenderProfileThemeColors.map((color) => (
            <label className="profile-color-option" data-profile-theme={color} key={color}>
              <input
                defaultChecked={color === themeColor}
                name="themeColor"
                type="radio"
                value={color}
              />
              <span>{t(`profiles.color.${color}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="profile-preview-chip" data-profile-theme={themeColor}>
        <span aria-hidden="true">{avatarEmoji}</span>
        <strong>{t("profiles.preview")}</strong>
      </div>
    </div>
  );
}
