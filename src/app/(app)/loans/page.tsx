import { CreateLoanSheet } from "@/components/loans/create-loan-sheet";
import { LoanBrowser } from "@/components/loans/loan-browser";
import { PageHeader } from "@/components/ui/page-header";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getLoans } from "@/lib/loans/queries";

export default async function LoansPage() {
  const { loans, error } = await getLoans("active");
  const todayDate = getTodayDateKey();

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Active book"
        title="Loans"
        description="Create and manage active loans stored in Supabase."
        action={<CreateLoanSheet />}
      />

      <section className="panel">
        {error ? (
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
