import { redirect } from "next/navigation";
import { isPreviewMode } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import {
  defaultLenderProfileAvatar,
  defaultLenderProfileThemeColor,
} from "@/lib/lender-profiles/identity";
import {
  mapLenderProfileRow,
  type LenderProfileListResult,
  type LenderProfileResult,
  type LenderProfileRow,
} from "@/lib/lender-profiles/types";

async function getAuthenticatedSupabase() {
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

  return { supabase, user };
}

export async function getLenderProfiles(): Promise<LenderProfileListResult> {
  if (isPreviewMode()) {
    return {
      profiles: [
        {
          id: "preview-lender-profile",
          userId: "preview-user",
          name: "Preview lender",
          avatarEmoji: defaultLenderProfileAvatar,
          themeColor: defaultLenderProfileThemeColor,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
  }

  const { supabase, user } = await getAuthenticatedSupabase();

  const { data, error } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      profiles: [],
      error: error.message,
    };
  }

  return {
    profiles: ((data ?? []) as LenderProfileRow[]).map(mapLenderProfileRow),
  };
}

export async function getLenderProfile(
  profileId: string,
): Promise<LenderProfileResult> {
  if (isPreviewMode()) {
    const profile =
      profileId === "preview-lender-profile"
        ? {
            id: "preview-lender-profile",
            userId: "preview-user",
            name: "Preview lender",
            avatarEmoji: defaultLenderProfileAvatar,
            themeColor: defaultLenderProfileThemeColor,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          }
        : null;

    return {
      profile,
      error: profile ? undefined : "Preview lender profile not found.",
    };
  }

  const { supabase, user } = await getAuthenticatedSupabase();

  const { data, error } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      profile: null,
      error: error.message,
    };
  }

  return {
    profile: data ? mapLenderProfileRow(data as LenderProfileRow) : null,
    error: data ? undefined : "Lender profile not found.",
  };
}
