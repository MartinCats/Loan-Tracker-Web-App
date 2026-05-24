import { signOutAction } from "@/app/auth/actions";
import { SettingsContent } from "@/components/settings/settings-content";
import { isPreviewMode } from "@/lib/preview";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default function SettingsPage() {
  const previewMode = isPreviewMode();

  return (
    <SettingsContent
      isPreviewMode={previewMode}
      isSupabaseReady={isSupabaseConfigured()}
      signOut={signOutAction}
    />
  );
}
