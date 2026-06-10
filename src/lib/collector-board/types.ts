import type { LenderProfileThemeColor } from "@/lib/lender-profiles/types";
import type { Loan } from "@/lib/types/loan";

export type CollectorFilter = "today" | "week" | "month" | "all";

export type CollectionShareRow = {
  id: string;
  owner_user_id: string;
  token: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CollectionShareProfileRow = {
  id: string;
  share_id: string;
  lender_profile_id: string;
  created_at: string;
};

export type CollectionShare = {
  id: string;
  ownerUserId: string;
  token: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileIds: string[];
};

export type CollectorProfileIdentity = {
  id: string;
  name: string;
  avatarEmoji: string;
  themeColor: LenderProfileThemeColor;
};

export type CollectorLoan = Loan & {
  lenderProfile: CollectorProfileIdentity;
  amountDue: number;
  isCollected: boolean;
};

export type CollectorDateGroup = {
  dueDate: string;
  loans: CollectorLoan[];
};

export type CollectorBoardResult =
  | {
      status: "ok";
      share: CollectionShare;
      groups: CollectorDateGroup[];
      totalLoans: number;
      filter: CollectorFilter;
      todayDate: string;
      lastUpdatedAt: string;
    }
  | {
      status: "unavailable";
      reason: "invalid" | "inactive" | "not_configured";
    };

export type CollectorCountdownTone =
  | "collected"
  | "overdue"
  | "today"
  | "soon"
  | "future";

export type CollectorCountdown = {
  tone: CollectorCountdownTone;
  en: string;
  th: string;
  daysUntilDue: number;
};

export function mapCollectionShareRow(
  row: CollectionShareRow,
  profileIds: string[] = [],
): CollectionShare {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    token: row.token,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profileIds,
  };
}
