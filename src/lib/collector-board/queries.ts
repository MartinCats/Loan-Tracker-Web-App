import { redirect } from "next/navigation";
import { calculateTotalDue } from "@/lib/payments/calculator";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isPreviewMode } from "@/lib/preview";
import {
  filterActiveCollectorLoans,
  filterCollectorLoansByRange,
  filterCollectorLoansByProfileIds,
  getCollectorShareUnavailableReason,
  groupCollectorLoansByDueDate,
  normalizeCollectorFilter,
} from "@/lib/collector-board/calculator";
import {
  mapCollectionShareRow,
  type CollectionShare,
  type CollectionShareProfileRow,
  type CollectionShareRow,
  type CollectorBoardResult,
  type CollectorFilter,
  type CollectorLoan,
  type CollectorProfileIdentity,
} from "@/lib/collector-board/types";
import { mapLoanRow, type LoanRow } from "@/lib/loans/types";
import {
  mapLenderProfileRow,
  type LenderProfile,
  type LenderProfileRow,
} from "@/lib/lender-profiles/types";

type ShareListResult = {
  shares: CollectionShare[];
  error?: string;
};

type AuthenticatedSupabase = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  user: {
    id: string;
  };
};

type CollectorLoanRow = LoanRow & {
  lender_profiles:
    | LenderProfileRow
    | LenderProfileRow[]
    | null;
};

async function getAuthenticatedSupabase(): Promise<AuthenticatedSupabase> {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/sign-in");
  }

  return {
    supabase,
    user,
  };
}

export async function getCollectionShares(): Promise<ShareListResult> {
  if (isPreviewMode()) {
    return { shares: [] };
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { data: shareRows, error } = await supabase
    .from("collection_shares")
    .select("id,owner_user_id,token,name,is_active,created_at,updated_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { shares: [], error: error.message };
  }

  const shares = (shareRows ?? []) as CollectionShareRow[];
  const shareIds = shares.map((share) => share.id);

  if (shareIds.length === 0) {
    return { shares: [] };
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("collection_share_profiles")
    .select("id,share_id,lender_profile_id,created_at")
    .in("share_id", shareIds);

  if (profileError) {
    return { shares: [], error: profileError.message };
  }

  const profileIdsByShare = new Map<string, string[]>();

  for (const row of (profileRows ?? []) as CollectionShareProfileRow[]) {
    profileIdsByShare.set(row.share_id, [
      ...(profileIdsByShare.get(row.share_id) ?? []),
      row.lender_profile_id,
    ]);
  }

  return {
    shares: shares.map((share) =>
      mapCollectionShareRow(share, profileIdsByShare.get(share.id) ?? []),
    ),
  };
}

export async function getCollectorBoardData({
  filter,
  token,
}: {
  filter?: string | string[];
  token: string;
}): Promise<CollectorBoardResult> {
  const { supabase } = await getCollectorReadSupabaseClient();

  if (!supabase) {
    const reason = getCollectorShareUnavailableReason(null, false);

    return {
      reason: reason ?? "not_configured",
      status: "unavailable",
    };
  }

  const { data: shareRow, error: shareError } = await supabase
    .from("collection_shares")
    .select("id,owner_user_id,token,name,is_active,created_at,updated_at")
    .eq("token", token)
    .maybeSingle();

  if (shareError || !shareRow) {
    const reason = getCollectorShareUnavailableReason(null);

    return {
      reason: reason ?? "invalid",
      status: "unavailable",
    };
  }

  const { data: shareProfiles, error: shareProfilesError } = await supabase
    .from("collection_share_profiles")
    .select("id,share_id,lender_profile_id,created_at")
    .eq("share_id", shareRow.id);

  if (shareProfilesError) {
    return {
      reason: "invalid",
      status: "unavailable",
    };
  }

  const profileIds = ((shareProfiles ?? []) as CollectionShareProfileRow[]).map(
    (profile) => profile.lender_profile_id,
  );
  const share = mapCollectionShareRow(shareRow as CollectionShareRow, profileIds);

  const unavailableReason = getCollectorShareUnavailableReason(share);

  if (unavailableReason) {
    return {
      reason: unavailableReason,
      status: "unavailable",
    };
  }

  const selectedFilter = normalizeCollectorFilter(filter);

  if (profileIds.length === 0) {
    return {
      filter: selectedFilter,
      groups: [],
      lastUpdatedAt: new Date().toISOString(),
      share,
      status: "ok",
      todayDate: getBangkokDateKey(),
      totalLoans: 0,
    };
  }

  const { data: loanRows, error: loanError } = await supabase
    .from("loans")
    .select(
      "id,user_id,lender_profile_id,borrower_name,principal,interest_rate,payment_cycle,current_due_date,accumulated_profit,unpaid_interest,credit_balance,status,created_at,updated_at,lender_profiles!inner(id,user_id,name,avatar_emoji,theme_color,created_at,updated_at)",
    )
    .eq("user_id", share.ownerUserId)
    .eq("status", "active")
    .in("lender_profile_id", profileIds)
    .order("current_due_date", { ascending: true });

  if (loanError) {
    return {
      reason: "invalid",
      status: "unavailable",
    };
  }

  const todayDate = getBangkokDateKey();
  const loans = filterActiveCollectorLoans(
    filterCollectorLoansByProfileIds(
      ((loanRows ?? []) as CollectorLoanRow[]).map(mapCollectorLoanRow),
      profileIds,
    ),
  );
  const filteredLoans = filterCollectorLoansByRange(
    loans,
    selectedFilter,
    todayDate,
  );

  return {
    filter: selectedFilter,
    groups: groupCollectorLoansByDueDate(filteredLoans),
    lastUpdatedAt: new Date().toISOString(),
    share,
    status: "ok",
    todayDate,
    totalLoans: filteredLoans.length,
  };
}

async function getCollectorReadSupabaseClient() {
  const adminClient = createAdminClient();

  if (adminClient) {
    return {
      isPublicCollectorReady: true,
      supabase: adminClient,
    };
  }

  const authenticatedClient = await createClient();

  if (!authenticatedClient) {
    return {
      isPublicCollectorReady: false,
      supabase: null,
    };
  }

  const {
    data: { user },
  } = await authenticatedClient.auth.getUser();

  return {
    isPublicCollectorReady: Boolean(user),
    supabase: user ? authenticatedClient : null,
  };
}

function mapCollectorLoanRow(row: CollectorLoanRow): CollectorLoan {
  const loan = mapLoanRow(row);
  const lenderProfileRow = Array.isArray(row.lender_profiles)
    ? row.lender_profiles[0]
    : row.lender_profiles;
  const lenderProfile = lenderProfileRow
    ? mapLenderProfileRow(lenderProfileRow)
    : getFallbackLenderProfile(loan.userId, loan.lenderProfileId);
  const amountDue = calculateTotalDue(loan);

  return {
    ...loan,
    amountDue,
    isCollected: amountDue <= 0,
    lenderProfile: {
      avatarEmoji: lenderProfile.avatarEmoji,
      id: lenderProfile.id,
      name: lenderProfile.name,
      themeColor: lenderProfile.themeColor,
    },
  };
}

function getFallbackLenderProfile(
  userId: string,
  profileId: string,
): LenderProfile {
  return {
    avatarEmoji: "👤",
    createdAt: "",
    id: profileId,
    name: "Lender",
    themeColor: "green",
    updatedAt: "",
    userId,
  };
}

function getBangkokDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Bangkok",
    year: "numeric",
  }).formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}
