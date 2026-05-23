export default function AppLoading() {
  return (
    <main className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Loading</p>
          <h2>Loan data</h2>
          <p>Fetching your secure loan workspace.</p>
        </div>
      </section>

      <section className="metric-grid" aria-hidden="true">
        <div className="metric-card skeleton-card" />
        <div className="metric-card skeleton-card" />
        <div className="metric-card skeleton-card" />
        <div className="metric-card skeleton-card" />
      </section>

      <section className="panel">
        <div className="skeleton-list" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
