import { ActionButton } from "@/components/ui/action-button";
import { PageHeader } from "@/components/ui/page-header";
import { loanPreview } from "@/lib/mock/dashboard";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function LoansPage() {
  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Active book"
        title="Loans"
        description="CRUD is intentionally paused for Phase 2. This screen establishes the list density and action placement."
        action={<ActionButton href="/loans">Add</ActionButton>}
      />

      <section className="panel">
        <div className="loan-list">
          {loanPreview
            .filter((loan) => loan.status === "active")
            .map((loan) => (
              <article className="loan-row loan-row--tall" key={loan.id}>
                <div>
                  <h3>{loan.borrowerName}</h3>
                  <p>
                    {loan.paymentCycle} - due {loan.currentDueDate}
                  </p>
                </div>
                <div className="loan-row__meta">
                  <span>Principal</span>
                  <strong>{money.format(loan.principal)}</strong>
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
