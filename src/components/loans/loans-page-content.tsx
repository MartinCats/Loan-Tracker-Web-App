"use client";

import { LoanBrowser } from "@/components/loans/loan-browser";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
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
  const previewStore = usePreviewStore();
  const loans = previewStore
    ? previewStore.loans.filter((loan) => loan.status === "active")
    : initialLoans;

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Active book"
        title="Loans"
        description={
          previewStore
            ? "Preview data resets on refresh."
            : "Create and manage active loans stored in Supabase."
        }
      />

      <section className="panel">
        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>Could not load loans</h3>
            <p>{error}</p>
          </div>
        ) : (
          <LoanBrowser loans={loans} todayDate={todayDate} />
        )}
      </section>
    </main>
  );
}
