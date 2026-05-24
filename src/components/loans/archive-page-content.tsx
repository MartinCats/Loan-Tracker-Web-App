"use client";

import { LoanList } from "@/components/loans/loan-list";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { Loan } from "@/lib/types/loan";

type ArchivePageContentProps = {
  error?: string;
  initialLoans: Loan[];
  todayDate: string;
};

export function ArchivePageContent({
  error,
  initialLoans,
  todayDate,
}: ArchivePageContentProps) {
  const { t } = useI18n();
  const previewStore = usePreviewStore();
  const loans = previewStore
    ? previewStore.loans.filter((loan) => loan.status === "closed")
    : initialLoans;

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow={t("archive.closed")}
        title={t("archive.title")}
        description={t("archive.description")}
      />

      <section className="panel">
        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>{t("archive.couldNotLoad")}</h3>
            <p>{error}</p>
          </div>
        ) : (
          <LoanList
            emptyDescription={t("archive.emptyDescription")}
            emptyTitle={t("archive.emptyTitle")}
            loans={loans}
            mode="archive"
            todayDate={todayDate}
          />
        )}
      </section>
    </main>
  );
}
