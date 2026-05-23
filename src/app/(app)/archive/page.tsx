import { PageHeader } from "@/components/ui/page-header";
import { loanPreview } from "@/lib/mock/dashboard";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function ArchivePage() {
  const archivedLoans = loanPreview.filter((loan) => loan.status === "closed");

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Closed"
        title="Archive"
        description="Archived loans are read-only except delete. Phase 1 shows the final destination for closed loans."
      />

      <section className="panel">
        <div className="loan-list">
          {archivedLoans.map((loan) => (
            <article className="loan-row loan-row--tall" key={loan.id}>
              <div>
                <h3>{loan.borrowerName}</h3>
                <p>Closed loan - profit locked</p>
              </div>
              <div className="loan-row__meta">
                <span>Profit</span>
                <strong>{money.format(loan.accumulatedProfit)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
