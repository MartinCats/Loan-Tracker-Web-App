import { LoanList } from "@/components/loans/loan-list";
import { PageHeader } from "@/components/ui/page-header";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getLoans } from "@/lib/loans/queries";

export default async function ArchivePage() {
  const { loans, error } = await getLoans("closed");
  const todayDate = getTodayDateKey();

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Closed"
        title="Archive"
        description="Closed loans stay available for review without payment flows."
      />

      <section className="panel">
        {error ? (
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
