export function AppLoadingScreen() {
  return (
    <div className="app-frame app-loading-screen">
      <div className="app-chrome">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Loan Tracker</p>
            <h1>Personal lending</h1>
          </div>
          <span className="profile-button" aria-hidden="true">
            LT
          </span>
        </header>

        <div className="content-shell">
          <main className="page-stack">
            <section className="page-header">
              <div>
                <p className="eyebrow">Today</p>
                <h2>Dashboard</h2>
                <p>Live loan metrics from your Supabase account.</p>
              </div>
              <div className="sheet-trigger-group" aria-hidden="true">
                <span className="plain-button plain-button--primary app-loading-action">
                  <span>+</span>
                  Add loan
                </span>
              </div>
            </section>

            <section className="metric-grid" aria-hidden="true">
              <span className="metric-card skeleton-card" />
              <span className="metric-card skeleton-card" />
              <span className="metric-card skeleton-card" />
              <span className="metric-card skeleton-card" />
            </section>

            <section className="panel app-loading-panel">
              <div className="section-heading">
                <div>
                  <span className="app-loading-line app-loading-line--title" />
                  <span className="app-loading-line app-loading-line--text" />
                </div>
                <span className="status-pill">Loading</span>
              </div>
              <div className="skeleton-list" aria-hidden="true">
                <span />
                <span />
              </div>
            </section>
          </main>
        </div>

        <nav className="bottom-nav app-loading-bottom-nav" aria-hidden="true">
          <span className="bottom-nav__item is-active">
            <span className="nav-icon nav-icon--grid" />
            <span>Dashboard</span>
          </span>
          <span className="bottom-nav__item">
            <span className="nav-icon nav-icon--stack" />
            <span>Loans</span>
          </span>
          <span className="bottom-nav__item">
            <span className="nav-icon nav-icon--box" />
            <span>Archive</span>
          </span>
          <span className="bottom-nav__item">
            <span className="nav-icon nav-icon--gear" />
            <span>Settings</span>
          </span>
        </nav>
      </div>
    </div>
  );
}
