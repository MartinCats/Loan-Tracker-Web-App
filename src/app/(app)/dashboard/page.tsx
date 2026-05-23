import { ActionButton } from "@/components/ui/action-button";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { dashboardMetrics, loanPreview } from "@/lib/mock/dashboard";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const metrics = [
  {
    label: "Lifetime Profit",
    value: money.format(dashboardMetrics.lifetimeProfit),
    tone: "gold" as const,
  },
  {
    label: "Expected Profit",
    value: money.format(dashboardMetrics.expectedProfit),
  },
  {
    label: "Principal Active",
    value: money.format(dashboardMetrics.principalActive),
  },
  {
    label: "Active Loans",
    value: String(dashboardMetrics.activeLoans),
  },
];

export default function DashboardPage() {
  const activeLoans = loanPreview.filter((loan) => loan.status === "active");

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Today"
        title="Dashboard"
        description="Phase 1 uses local placeholder data. Supabase auth and RLS arrive in Phase 2."
        action={<ActionButton href="/loans">New loan</ActionButton>}
      />

      <section className="metric-grid" aria-label="Dashboard metrics">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            tone={metric.tone}
          />
        ))}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Upcoming dues</h2>
            <p>Touch-first list layout for the future payment flow.</p>
          </div>
          <span className="status-pill">{activeLoans.length} active</span>
        </div>

        <div className="loan-list">
          {activeLoans.map((loan) => (
            <article className="loan-row" key={loan.id}>
              <div>
                <h3>{loan.borrowerName}</h3>
                <p>
                  {money.format(loan.principal)} principal - {loan.interestRate}
                  % monthly
                </p>
              </div>
              <div className="loan-row__meta">
                <span>Due</span>
                <strong>{loan.currentDueDate}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
