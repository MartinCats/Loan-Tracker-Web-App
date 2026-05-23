"use client";

import { LoanList } from "@/components/loans/loan-list";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
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
  const previewStore = usePreviewStore();
  const loans = previewStore
    ? previewStore.loans.filter((loan) => loan.status === "closed")
    : initialLoans;

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Closed"
        title="Archive"
        description="Closed loans stay available for review without payment flows."
      />

      <section className="panel">
        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>Could not load archive</h3>
            <p>{error}</p>
          </div>
        ) : (
          <LoanList
            emptyDescription="Closed loans will appear here for read-only review."
            emptyTitle="No archived loans"
            loans={loans}
            mode="archive"
            todayDate={todayDate}
          />
        )}
      </section>
    </main>
  );
}
