import { BottomNav } from "@/components/app/bottom-nav";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-frame">
      <div className="app-chrome">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Loan Tracker</p>
            <h1>Personal lending</h1>
          </div>
          <a className="profile-button" href="/auth/sign-in" aria-label="Open sign in">
            LT
          </a>
        </header>

        <div className="content-shell">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
