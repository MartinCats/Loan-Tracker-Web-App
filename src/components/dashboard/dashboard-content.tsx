"use client";

import { CreateLoanSheet } from "@/components/loans/create-loan-sheet";
import { DashboardDueCard } from "@/components/dashboard/dashboard-due-card";
import { usePreviewStore } from "@/components/preview/preview-store";
import { MetricCard } from "@/components/ui/metric-card";
import { formatMoney } from "@/lib/format/money";
import { PageHeader } from "@/components/ui/page-header";
import { useI18n } from "@/lib/i18n/use-i18n";
import { calculateDashboardMetrics } from "@/lib/loans/metrics";
import {
  getDaysUntilDue,
  getUrgencyRank,
} from "@/lib/loans/urgency";
import type { LenderProfile } from "@/lib/lender-profiles/types";
import type { DashboardMetrics, Loan } from "@/lib/types/loan";

type DashboardContentProps = {
  activeLenderProfile?: LenderProfile | null;
  error?: string;
  initialLoans: Loan[];
  initialMetrics: DashboardMetrics;
  todayDate: string;
};

export function DashboardContent({
  activeLenderProfile,
  error,
  initialLoans,
  initialMetrics,
  todayDate,
}: DashboardContentProps) {
  const { t } = useI18n();
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
      label: t("dashboard.lifetimeProfit"),
      value: formatMoney(dashboardMetrics.lifetimeProfit),
      tone: "gold" as const,
    },
    {
      label: t("dashboard.expectedProfit"),
      value: formatMoney(dashboardMetrics.expectedProfit),
    },
    {
      label: t("dashboard.principalActive"),
      value: formatMoney(dashboardMetrics.principalActive),
    },
    {
      label: t("dashboard.activeLoans"),
      value: String(dashboardMetrics.activeLoans),
    },
  ];

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow={t("dashboard.today")}
        title={t("dashboard.title")}
        description={
          previewStore
            ? t("dashboard.previewDescription")
            : t("dashboard.liveDescription")
        }
        action={<CreateLoanSheet />}
      />

      <section className="metric-grid" aria-label={t("dashboard.metrics")}>
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
            <h2>{t("dashboard.upcomingDues")}</h2>
            <p>{t("dashboard.upcomingDescription")}</p>
          </div>
          <span className="status-pill">{activeLoans.length} {t("common.active")}</span>
        </div>

        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>{t("dashboard.couldNotLoadLoans")}</h3>
            <p>{error}</p>
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="empty-state dashboard-empty-state" data-profile-theme={activeLenderProfile?.themeColor ?? "green"}>
            {activeLenderProfile ? (
              <div className="empty-profile-identity">
                <span aria-hidden="true">{activeLenderProfile.avatarEmoji}</span>
                <strong>{activeLenderProfile.name}</strong>
              </div>
            ) : null}
            <h3>{t("profiles.dashboardEmptyTitle")}</h3>
            <p>{t("profiles.dashboardEmptyDescription")}</p>
            <div className="empty-state__action">
              <CreateLoanSheet />
            </div>
          </div>
        ) : (
          <div className="dashboard-due-list">
            {activeLoans.slice(0, 4).map((loan) => (
              <DashboardDueCard key={loan.id} loan={loan} todayDate={todayDate} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
