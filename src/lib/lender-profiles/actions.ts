"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  clearActiveLenderProfileIdCookie,
  getActiveLenderProfileIdFromCookies,
  setActiveLenderProfileIdCookie,
} from "@/lib/lender-profiles/active-profile";
import {
  defaultLenderProfileAvatar,
  defaultLenderProfileThemeColor,
  isLenderProfileThemeColor,
  normalizeLenderProfileAvatar,
} from "@/lib/lender-profiles/identity";
import {
  canDeleteProfile,
  shouldResetActiveProfileAfterDelete,
} from "@/lib/lender-profiles/safety";
import { isPreviewMode } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import type {
  LenderProfileInsert,
  LenderProfileUpdate,
} from "@/lib/lender-profiles/types";

export type LenderProfileActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

type AuthenticatedSupabase =
  | {
      supabase: SupabaseClient;
      user: User;
    }
  | {
      error: string;
    };

type ParsedProfileName =
  | {
      ok: true;
      name: string;
      avatarEmoji: string;
      themeColor: LenderProfileUpdate["theme_color"];
    }
  | {
      ok: false;
      message: string;
    };

async function getAuthenticatedSupabase(): Promise<AuthenticatedSupabase> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured. Add the public URL and anon key.",
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: "Sign in again before changing lender profiles.",
    };
  }

  return { supabase, user };
}

function parseProfileName(formData: FormData): ParsedProfileName {
  const name = String(formData.get("name") ?? "").trim();
  const avatarEmoji = normalizeLenderProfileAvatar(
    String(formData.get("avatarEmoji") ?? defaultLenderProfileAvatar),
  );
  const themeColor = String(
    formData.get("themeColor") ?? defaultLenderProfileThemeColor,
  );

  if (!name) {
    return { ok: false, message: "Enter a lender profile name." };
  }

  if (name.length > 80) {
    return {
      ok: false,
      message: "Lender profile name must be 80 characters or fewer.",
    };
  }

  if (!isLenderProfileThemeColor(themeColor)) {
    return {
      ok: false,
      message: "Choose a valid profile color.",
    };
  }

  return { ok: true, name, avatarEmoji, themeColor };
}

function parseProfileId(formData: FormData) {
  return String(formData.get("profileId") ?? "").trim();
}

function revalidateProfileViews() {
  revalidatePath("/dashboard");
  revalidatePath("/loans");
  revalidatePath("/archive");
  revalidatePath("/settings");
  revalidatePath("/profiles");
}

export async function createLenderProfileAction(
  _prevState: LenderProfileActionState,
  formData: FormData,
): Promise<LenderProfileActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview Mode: lender profile creation is simulated.",
    };
  }

  const parsed = parseProfileName(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const row: LenderProfileInsert = {
    user_id: auth.user.id,
    name: parsed.name,
    avatar_emoji: parsed.avatarEmoji,
    theme_color: parsed.themeColor,
  };

  const { error } = await auth.supabase.from("lender_profiles").insert(row);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidateProfileViews();

  return { status: "success", message: "Lender profile created." };
}

export async function createLenderProfileFormAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect("/profiles");
  }

  const parsed = parseProfileName(formData);

  if (!parsed.ok) {
    redirect(`/profiles?error=${encodeURIComponent(parsed.message)}`);
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(`/profiles?error=${encodeURIComponent(auth.error)}`);
  }

  const { error } = await auth.supabase.from("lender_profiles").insert({
    user_id: auth.user.id,
    name: parsed.name,
    avatar_emoji: parsed.avatarEmoji,
    theme_color: parsed.themeColor,
  } satisfies LenderProfileInsert);

  if (error) {
    redirect(`/profiles?error=${encodeURIComponent(error.message)}`);
  }

  revalidateProfileViews();
  redirect("/profiles");
}

export async function selectLenderProfileAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect("/dashboard");
  }

  const profileId = parseProfileId(formData);

  if (!profileId) {
    redirect("/profiles?error=Lender%20profile%20is%20missing.");
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(`/profiles?error=${encodeURIComponent(auth.error)}`);
  }

  const { data, error } = await auth.supabase
    .from("lender_profiles")
    .select("id")
    .eq("id", profileId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    redirect(`/profiles?error=${encodeURIComponent(error.message)}`);
  }

  if (!data) {
    redirect("/profiles?error=Lender%20profile%20not%20found.");
  }

  await setActiveLenderProfileIdCookie(profileId);
  revalidateProfileViews();
  redirect("/dashboard");
}

export async function updateLenderProfileAction(
  _prevState: LenderProfileActionState,
  formData: FormData,
): Promise<LenderProfileActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview Mode: lender profile update is simulated.",
    };
  }

  const profileId = parseProfileId(formData);

  if (!profileId) {
    return { status: "error", message: "Lender profile is missing." };
  }

  const parsed = parseProfileName(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const update: LenderProfileUpdate = {
    name: parsed.name,
    avatar_emoji: parsed.avatarEmoji,
    theme_color: parsed.themeColor,
  };

  const { error } = await auth.supabase
    .from("lender_profiles")
    .update(update)
    .eq("id", profileId)
    .eq("user_id", auth.user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidateProfileViews();

  return { status: "success", message: "Lender profile updated." };
}

export async function updateLenderProfileFormAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect("/profiles");
  }

  const profileId = parseProfileId(formData);

  if (!profileId) {
    redirect("/profiles?error=Lender%20profile%20is%20missing.");
  }

  const parsed = parseProfileName(formData);

  if (!parsed.ok) {
    redirect(`/profiles?error=${encodeURIComponent(parsed.message)}`);
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(`/profiles?error=${encodeURIComponent(auth.error)}`);
  }

  const { error } = await auth.supabase
    .from("lender_profiles")
    .update({
      name: parsed.name,
      avatar_emoji: parsed.avatarEmoji,
      theme_color: parsed.themeColor,
    } satisfies LenderProfileUpdate)
    .eq("id", profileId)
    .eq("user_id", auth.user.id);

  if (error) {
    redirect(`/profiles?error=${encodeURIComponent(error.message)}`);
  }

  revalidateProfileViews();
  redirect("/profiles");
}

export async function deleteLenderProfileAction(
  _prevState: LenderProfileActionState,
  formData: FormData,
): Promise<LenderProfileActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview Mode: lender profile deletion is simulated.",
    };
  }

  const profileId = parseProfileId(formData);

  if (!profileId) {
    return { status: "error", message: "Lender profile is missing." };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { count, error: countError } = await auth.supabase
    .from("lender_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  if (countError) {
    return { status: "error", message: countError.message };
  }

  if (!canDeleteProfile(count ?? 0)) {
    return {
      status: "error",
      message: "Create another lender profile before deleting this one.",
    };
  }

  const activeProfileId = await getActiveLenderProfileIdFromCookies();
  const shouldResetActiveProfile = shouldResetActiveProfileAfterDelete(
    profileId,
    activeProfileId,
  );

  const { error } = await auth.supabase
    .from("lender_profiles")
    .delete()
    .eq("id", profileId)
    .eq("user_id", auth.user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  if (shouldResetActiveProfile) {
    await clearActiveLenderProfileIdCookie();
  }

  revalidateProfileViews();

  return { status: "success", message: "Lender profile deleted." };
}

export async function deleteLenderProfileFormAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect("/profiles");
  }

  const profileId = parseProfileId(formData);

  if (!profileId) {
    redirect("/profiles?error=Lender%20profile%20is%20missing.");
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(`/profiles?error=${encodeURIComponent(auth.error)}`);
  }

  const { count, error: countError } = await auth.supabase
    .from("lender_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  if (countError) {
    redirect(`/profiles?error=${encodeURIComponent(countError.message)}`);
  }

  if (!canDeleteProfile(count ?? 0)) {
    redirect(
      "/profiles?error=Create%20another%20lender%20profile%20before%20deleting%20this%20one.",
    );
  }

  const activeProfileId = await getActiveLenderProfileIdFromCookies();
  const shouldResetActiveProfile = shouldResetActiveProfileAfterDelete(
    profileId,
    activeProfileId,
  );

  const { error } = await auth.supabase
    .from("lender_profiles")
    .delete()
    .eq("id", profileId)
    .eq("user_id", auth.user.id);

  if (error) {
    redirect(`/profiles?error=${encodeURIComponent(error.message)}`);
  }

  if (shouldResetActiveProfile) {
    await clearActiveLenderProfileIdCookie();
  }

  revalidateProfileViews();
  redirect("/profiles");
}
