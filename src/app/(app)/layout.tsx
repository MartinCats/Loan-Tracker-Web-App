import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppLoadingScreen } from "@/components/app/app-loading-screen";
import { AppShell } from "@/components/app/app-shell";
import { getActiveOrDefaultLenderProfile } from "@/lib/lender-profiles/default-profile";
import { mapLenderProfileRow, type LenderProfileRow } from "@/lib/lender-profiles/types";
import { isPreviewMode } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <ProtectedAppShell>{children}</ProtectedAppShell>
    </Suspense>
  );
}

async function ProtectedAppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isPreviewMode()) {
    return (
      <AppShell
        activeLenderProfileId="preview-lender-profile"
        isPreviewMode
        lenderProfiles={[
          {
            id: "preview-lender-profile",
            userId: "preview-user",
            name: "Preview lender",
            avatarEmoji: "👦🏻",
            themeColor: "green",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      >
        {children}
      </AppShell>
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { profile: activeProfile } = await getActiveOrDefaultLenderProfile(
    supabase,
    user,
  );
  const { data } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  const lenderProfiles = ((data ?? []) as LenderProfileRow[]).map(
    mapLenderProfileRow,
  );

  return (
    <AppShell
      activeLenderProfileId={activeProfile?.id}
      lenderProfiles={lenderProfiles}
    >
      {children}
    </AppShell>
  );
}
