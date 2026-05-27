import { redirect } from "next/navigation";
import { ProfileManageContent } from "@/components/profiles/profile-manage-content";
import { getActiveOrDefaultLenderProfile } from "@/lib/lender-profiles/default-profile";
import { mapLenderProfileRow, type LenderProfileRow } from "@/lib/lender-profiles/types";
import { createClient } from "@/lib/supabase/server";

type ManageProfilesPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ManageProfilesPage({
  searchParams,
}: ManageProfilesPageProps) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/sign-in");
  }

  const { error: activeProfileError } = await getActiveOrDefaultLenderProfile(
    supabase,
    user,
  );
  const { data, error } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  const profiles = ((data ?? []) as LenderProfileRow[]).map(
    mapLenderProfileRow,
  );
  const { error: actionError } = await searchParams;

  return (
    <ProfileManageContent
      error={actionError ?? activeProfileError ?? error?.message}
      profiles={profiles}
    />
  );
}
