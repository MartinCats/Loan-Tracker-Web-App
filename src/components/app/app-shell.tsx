import { BottomNav } from "@/components/app/bottom-nav";
import { TopBar } from "@/components/app/top-bar";
import { PreviewProvider } from "@/components/preview/preview-store";
import { ActionFeedbackProvider } from "@/components/ui/action-feedback";
import type { LenderProfile } from "@/lib/lender-profiles/types";

export function AppShell({
  activeLenderProfileId,
  children,
  isPreviewMode = false,
  lenderProfiles = [],
}: Readonly<{
  activeLenderProfileId?: string;
  children: React.ReactNode;
  isPreviewMode?: boolean;
  lenderProfiles?: LenderProfile[];
}>) {
  const activeProfile = lenderProfiles.find(
    (profile) => profile.id === activeLenderProfileId,
  );
  const shell = (
    <ActionFeedbackProvider>
      <div className="app-frame" data-profile-theme={activeProfile?.themeColor ?? "green"}>
        <div className="app-chrome">
          <TopBar
            activeLenderProfileId={activeLenderProfileId}
            isPreviewMode={isPreviewMode}
            lenderProfiles={lenderProfiles}
          />

          <div className="content-shell">{children}</div>
          <BottomNav />
        </div>
      </div>
    </ActionFeedbackProvider>
  );

  return isPreviewMode ? (
    <PreviewProvider>{shell}</PreviewProvider>
  ) : (
    shell
  );
}
