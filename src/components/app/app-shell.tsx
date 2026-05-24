import { BottomNav } from "@/components/app/bottom-nav";
import { TopBar } from "@/components/app/top-bar";
import { PreviewProvider } from "@/components/preview/preview-store";
import { ActionFeedbackProvider } from "@/components/ui/action-feedback";

export function AppShell({
  children,
  isPreviewMode = false,
}: Readonly<{ children: React.ReactNode; isPreviewMode?: boolean }>) {
  const shell = (
    <ActionFeedbackProvider>
      <div className="app-frame">
        <div className="app-chrome">
          <TopBar isPreviewMode={isPreviewMode} />

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
