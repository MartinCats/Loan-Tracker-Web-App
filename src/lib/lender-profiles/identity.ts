import type { LenderProfileThemeColor } from "@/lib/lender-profiles/types";

export const lenderProfileAvatarOptions = ["🧑", "👩", "👨", "👵", "👴", "💼", "🏦", "🌱"] as const;

export const lenderProfileThemeColors = [
  "green",
  "gold",
  "blue",
  "rose",
] as const satisfies readonly LenderProfileThemeColor[];

export const defaultLenderProfileAvatar = "🧑";
export const defaultLenderProfileThemeColor: LenderProfileThemeColor = "green";

export const suggestedLenderProfilePresets = [
  {
    name: "แม่ปล่อยกู้",
    avatarEmoji: "👩",
    themeColor: "rose",
  },
  {
    name: "พ่อปล่อยกู้",
    avatarEmoji: "👨",
    themeColor: "blue",
  },
  {
    name: "เราปล่อยกู้",
    avatarEmoji: "🧑",
    themeColor: "green",
  },
] as const satisfies readonly {
  name: string;
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
