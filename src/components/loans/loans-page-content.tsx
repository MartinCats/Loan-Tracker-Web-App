"use client";

import { LoanBrowser } from "@/components/loans/loan-browser";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { Loan } from "@/lib/types/loan";

type LoansPageContentProps = {
  error?: string;
  initialLoans: Loan[];
  todayDate: string;
};

export function LoansPageContent({
  error,
  initialLoans,
  todayDate,
}: LoansPageContentProps) {
  const { t } = useI18n();
  const previewStore = usePreviewStore();
  const loans = previewStore
    ? previewStore.loans.filter((loan) => loan.status === "active")
    : initialLoans;

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow={t("loans.eyebrow")}
        title={t("loans.title")}
        description={
          previewStore
            ? t("dashboard.previewDescription")
            : t("loans.liveDescription")
        }
      />

      <section className="panel">
        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>{t("loans.couldNotLoad")}</h3>
            <p>{error}</p>
          </div>
        ) : (
          <LoanBrowser loans={loans} todayDate={todayDate} />
        )}
      </section>
    </main>
  );
}
