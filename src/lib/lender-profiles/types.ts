export type LenderProfileThemeColor = "green" | "gold" | "blue" | "rose";

export type LenderProfile = {
  id: string;
  userId: string;
  name: string;
  avatarEmoji: string;
  themeColor: LenderProfileThemeColor;
  createdAt: string;
  updatedAt: string;
};

export type LenderProfileRow = {
  id: string;
  user_id: string;
  name: string;
  avatar_emoji: string;
  theme_color: LenderProfileThemeColor;
  created_at: string;
  updated_at: string;
};

export type LenderProfileInsert = {
  user_id: string;
  name: string;
  avatar_emoji?: string;
  theme_color?: LenderProfileThemeColor;
};

export type LenderProfileUpdate = {
  name: string;
  avatar_emoji?: string;
  theme_color?: LenderProfileThemeColor;
};

export type LenderProfileListResult = {
  profiles: LenderProfile[];
  error?: string;
};

export type LenderProfileResult = {
  profile: LenderProfile | null;
  error?: string;
};

export function mapLenderProfileRow(row: LenderProfileRow): LenderProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatarEmoji: row.avatar_emoji,
    themeColor: row.theme_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
