"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isPreviewMode } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";

export type CollectorShareActionState = {
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
      error: "Sign in again before changing collector links.",
    };
  }

  return { supabase, user };
}

function parseShareName(formData: FormData) {
  return String(formData.get("name") ?? "").trim();
}

function parseProfileIds(formData: FormData) {
  return formData
    .getAll("profileIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function parseShareId(formData: FormData) {
  return String(formData.get("shareId") ?? "").trim();
}

function getCollectorLinksPath(feedback?: string) {
  return feedback
    ? `/settings/collector-links?feedback=${feedback}`
    : "/settings/collector-links";
}

function revalidateCollectorLinkViews(token?: string) {
  revalidatePath("/settings");
  revalidatePath("/settings/collector-links");

  if (token) {
    revalidatePath(`/collect/${token}`);
  }
}

async function getOwnedShare(
  supabase: SupabaseClient,
  userId: string,
  shareId: string,
) {
  return supabase
    .from("collection_shares")
    .select("id,token")
    .eq("id", shareId)
    .eq("owner_user_id", userId)
    .maybeSingle();
}

async function verifyOwnedProfiles(
  supabase: SupabaseClient,
  userId: string,
  profileIds: string[],
) {
  if (profileIds.length === 0) {
    return false;
  }

  const uniqueProfileIds = Array.from(new Set(profileIds));
  const { data, error } = await supabase
    .from("lender_profiles")
    .select("id")
    .eq("user_id", userId)
    .in("id", uniqueProfileIds);

  if (error) {
    return false;
  }

  return (data ?? []).length === uniqueProfileIds.length;
}

export async function createCollectionShareAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect(getCollectorLinksPath("collector-created"));
  }

  const name = parseShareName(formData);
  const profileIds = Array.from(new Set(parseProfileIds(formData)));

  if (!name) {
    redirect(
      "/settings/collector-links?error=Enter%20a%20collector%20link%20name.",
    );
  }

  if (profileIds.length === 0) {
    redirect(
      "/settings/collector-links?error=Select%20at%20least%20one%20lender%20profile.",
    );
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(auth.error)}`,
    );
  }

  const profilesAreOwned = await verifyOwnedProfiles(
    auth.supabase,
    auth.user.id,
    profileIds,
  );

  if (!profilesAreOwned) {
    redirect(
      "/settings/collector-links?error=Selected%20profiles%20could%20not%20be%20verified.",
    );
  }

  const { data: share, error: shareError } = await auth.supabase
    .from("collection_shares")
    .insert({
      owner_user_id: auth.user.id,
      token: createShareToken(),
      name,
    })
    .select("id,token")
    .single();

  if (shareError || !share) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        shareError?.message ?? "Could not create collector link.",
      )}`,
    );
  }

  const { error: profilesError } = await auth.supabase
    .from("collection_share_profiles")
    .insert(
      profileIds.map((profileId) => ({
        lender_profile_id: profileId,
        share_id: share.id,
      })),
    );

  if (profilesError) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        profilesError.message,
      )}`,
    );
  }

  revalidateCollectorLinkViews(share.token);
  redirect(getCollectorLinksPath("collector-created"));
}

export async function updateCollectionShareProfilesAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect(getCollectorLinksPath("collector-saved"));
  }

  const shareId = parseShareId(formData);
  const profileIds = Array.from(new Set(parseProfileIds(formData)));

  if (!shareId || profileIds.length === 0) {
    redirect(
      "/settings/collector-links?error=Choose%20a%20link%20and%20at%20least%20one%20profile.",
    );
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(auth.error)}`,
    );
  }

  const { data: share, error: shareError } = await getOwnedShare(
    auth.supabase,
    auth.user.id,
    shareId,
  );

  if (shareError || !share) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        shareError?.message ?? "Collector link not found.",
      )}`,
    );
  }

  const profilesAreOwned = await verifyOwnedProfiles(
    auth.supabase,
    auth.user.id,
    profileIds,
  );

  if (!profilesAreOwned) {
    redirect(
      "/settings/collector-links?error=Selected%20profiles%20could%20not%20be%20verified.",
    );
  }

  const { error: deleteError } = await auth.supabase
    .from("collection_share_profiles")
    .delete()
    .eq("share_id", shareId);

  if (deleteError) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        deleteError.message,
      )}`,
    );
  }

  const { error: insertError } = await auth.supabase
    .from("collection_share_profiles")
    .insert(
      profileIds.map((profileId) => ({
        lender_profile_id: profileId,
        share_id: shareId,
      })),
    );

  if (insertError) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        insertError.message,
      )}`,
    );
  }

  revalidateCollectorLinkViews(share.token);
  redirect(getCollectorLinksPath("collector-saved"));
}

export async function setCollectionShareActiveAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect(getCollectorLinksPath("collector-saved"));
  }

  const shareId = parseShareId(formData);
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!shareId) {
    redirect("/settings/collector-links?error=Collector%20link%20is%20missing.");
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(auth.error)}`,
    );
  }

  const { data: share, error: shareError } = await getOwnedShare(
    auth.supabase,
    auth.user.id,
    shareId,
  );

  if (shareError || !share) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        shareError?.message ?? "Collector link not found.",
      )}`,
    );
  }

  const { error } = await auth.supabase
    .from("collection_shares")
    .update({ is_active: isActive })
    .eq("id", shareId)
    .eq("owner_user_id", auth.user.id);

  if (error) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidateCollectorLinkViews(share.token);
  redirect(getCollectorLinksPath(isActive ? "collector-reactivated" : "collector-paused"));
}

export async function deleteCollectionShareAction(formData: FormData) {
  if (isPreviewMode()) {
    redirect(getCollectorLinksPath("collector-deleted"));
  }

  const shareId = parseShareId(formData);

  if (!shareId) {
    redirect("/settings/collector-links?error=Collector%20link%20is%20missing.");
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(auth.error)}`,
    );
  }

  const { data: share, error: shareError } = await getOwnedShare(
    auth.supabase,
    auth.user.id,
    shareId,
  );

  if (shareError || !share) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(
        shareError?.message ?? "Collector link not found.",
      )}`,
    );
  }

  const { error } = await auth.supabase
    .from("collection_shares")
    .delete()
    .eq("id", shareId)
    .eq("owner_user_id", auth.user.id);

  if (error) {
    redirect(
      `/settings/collector-links?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidateCollectorLinkViews(share.token);
  redirect(getCollectorLinksPath("collector-deleted"));
}

function createShareToken() {
  return randomBytes(24).toString("base64url");
}
