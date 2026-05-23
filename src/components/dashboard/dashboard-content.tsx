"use client";

import Link from "next/link";
import { CreateLoanSheet } from "@/components/loans/create-loan-sheet";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { usePreviewStore } from "@/components/preview/preview-store";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { calculateDashboardMetrics } from "@/lib/loans/metrics";
import {
  getDaysUntilDue,
  getUrgencyRank,
} from "@/lib/loans/urgency";
import type { DashboardMetrics, Loan } from "@/lib/types/loan";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type DashboardContentProps = {
  error?: string;
  initialLoans: Loan[];
  initialMetrics: DashboardMetrics;
  todayDate: string;
};

export function DashboardContent({
  error,
  initialLoans,
  initialMetrics,
  todayDate,
}: DashboardContentProps) {
  const previewStore = usePreviewStore();
  const loans = previewStore?.loans ?? initialLoans;
  const dashboardMetrics = previewStore
    ? calculateDashboardMetrics(loans)
    : initialMetrics;
  const activeLoans = loans
    .filter((loan) => loan.status === "active")
    .sort(
      (a, b) =>
        getUrgencyRank(a, todayDate) - getUrgencyRank(b, todayDate) ||
        getDaysUntilDue(a.currentDueDate, todayDate) -
          getDaysUntilDue(b.currentDueDate, todayDate),
    );
  const metricCards = [
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

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Today"
        title="Dashboard"
        description={
          previewStore
            ? "Preview data resets on refresh."
            : "Live loan metrics from your Supabase account."
        }
        action={<CreateLoanSheet />}
      />

      <section className="metric-grid" aria-label="Dashboard metrics">
        {metricCards.map((metric) => (
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
            <p>Active loans ordered by current due date.</p>
          </div>
          <span className="status-pill">{activeLoans.length} active</span>
        </div>

        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>Could not load loans</h3>
            <p>{error}</p>
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="empty-state">
            <h3>No active loans yet</h3>
            <p>Create your first loan to populate metrics and upcoming dues.</p>
            <div className="empty-state__action">
              <CreateLoanSheet />
            </div>
          </div>
        ) : (
          <div className="loan-list">
            {activeLoans.slice(0, 4).map((loan) => (
              <article className="loan-row loan-row--interactive" key={loan.id}>
                <Link className="loan-row__link" href={`/loans/${loan.id}`}>
                  <h3>{loan.borrowerName}</h3>
                  <p>
                    {money.format(loan.principal)} principal -{" "}
                    {loan.interestRate}% interest
                  </p>
                </Link>
                <div className="loan-row__meta">
                  <LoanStatusPill loan={loan} todayDate={todayDate} />
                  <span>Due</span>
                  <strong>
                    <DueDateLabel dueDate={loan.currentDueDate} todayDate={todayDate} />
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
