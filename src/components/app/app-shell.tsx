import { BottomNav } from "@/components/app/bottom-nav";
import { PreviewProvider } from "@/components/preview/preview-store";

export function AppShell({
  children,
  isPreviewMode = false,
}: Readonly<{ children: React.ReactNode; isPreviewMode?: boolean }>) {
  const shell = (
    <div className="app-frame">
      <div className="app-chrome">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Loan Tracker</p>
            <h1>Personal lending</h1>
            {isPreviewMode ? <span className="preview-badge">Preview Mode</span> : null}
          </div>
          <a className="profile-button" href="/settings" aria-label="Open settings">
            LT
          </a>
        </header>

        <div className="content-shell">{children}</div>
        <BottomNav />
      </div>
    </div>
  );

  return isPreviewMode ? (
    <PreviewProvider>{shell}</PreviewProvider>
  ) : (
    shell
  );
}
