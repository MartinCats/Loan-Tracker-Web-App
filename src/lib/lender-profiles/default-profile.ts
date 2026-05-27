import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getActiveLenderProfileIdFromCookies } from "@/lib/lender-profiles/active-profile";
import {
  defaultLenderProfileAvatar,
  defaultLenderProfileThemeColor,
} from "@/lib/lender-profiles/identity";
import { resolveActiveProfile } from "@/lib/lender-profiles/safety";
import {
  mapLenderProfileRow,
  type LenderProfile,
  type LenderProfileRow,
} from "@/lib/lender-profiles/types";

const defaultProfileName = "เรา";

export async function getOrCreateDefaultLenderProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<{ profile: LenderProfile | null; error?: string }> {
  const { data: existingProfile, error: findError } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (findError) {
    return { profile: null, error: findError.message };
  }

  if (existingProfile) {
    return {
      profile: mapLenderProfileRow(existingProfile as LenderProfileRow),
    };
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("lender_profiles")
    .insert({
      user_id: user.id,
      name: defaultProfileName,
      avatar_emoji: defaultLenderProfileAvatar,
      theme_color: defaultLenderProfileThemeColor,
    })
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .single();

  if (createError) {
    return { profile: null, error: createError.message };
  }

  return {
    profile: mapLenderProfileRow(createdProfile as LenderProfileRow),
  };
}

export async function getActiveOrDefaultLenderProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<{ profile: LenderProfile | null; error?: string }> {
  const activeProfileId = await getActiveLenderProfileIdFromCookies();
  const { data: profilesData, error: profilesError } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("user_id", user.id);

  if (profilesError) {
    return { profile: null, error: profilesError.message };
  }

  const profiles = ((profilesData ?? []) as LenderProfileRow[]).map(
    mapLenderProfileRow,
  );
  const activeProfile = resolveActiveProfile(profiles, activeProfileId);

  if (activeProfile) {
    return { profile: activeProfile };
  }

  return getOrCreateDefaultLenderProfile(supabase, user);
}
