import type { LenderProfileThemeColor } from "@/lib/lender-profiles/types";

export const lenderProfileAvatarOptions = [
  "👦🏻",
  "👧🏻",
  "👨🏻",
  "👩🏻",
  "👴🏻",
  "👵🏻",
  "🐶",
  "🐱",
  "🐰",
  "🐻",
  "🦊",
  "🐼",
] as const;

export const lenderProfileThemeColors = [
  "green",
  "gold",
  "blue",
  "rose",
] as const satisfies readonly LenderProfileThemeColor[];

export const defaultLenderProfileAvatar = "👦🏻";
export const defaultLenderProfileThemeColor: LenderProfileThemeColor = "green";

export const suggestedLenderProfilePresets = [
  {
    labelKey: "profiles.preset.mom",
    avatarEmoji: "👩🏻",
    themeColor: "rose",
  },
  {
    labelKey: "profiles.preset.dad",
    avatarEmoji: "👨🏻",
    themeColor: "blue",
  },
  {
    labelKey: "profiles.preset.me",
    avatarEmoji: "👦🏻",
    themeColor: "green",
  },
] as const satisfies readonly {
  labelKey: string;
  avatarEmoji: string;
  themeColor: LenderProfileThemeColor;
}[];

export function isLenderProfileThemeColor(
  value: string,
): value is LenderProfileThemeColor {
  return lenderProfileThemeColors.includes(value as LenderProfileThemeColor);
}

export function normalizeLenderProfileAvatar(value: string) {
  const trimmed = value.trim();
  return trimmed || defaultLenderProfileAvatar;
}
