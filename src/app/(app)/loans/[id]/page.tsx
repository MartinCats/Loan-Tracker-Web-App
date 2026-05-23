import Link from "next/link";
import { notFound } from "next/navigation";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { ReceivePaymentSheet } from "@/components/payments/receive-payment-sheet";
import { PaymentTimeline } from "@/components/payments/payment-timeline";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { calculateExpectedDue, calculateTotalDue } from "@/lib/payments/calculator";
import { getLoanDetail } from "@/lib/payments/queries";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

type LoanDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;
  const { loan, payments, error } = await getLoanDetail(id);

  if (!loan && !error) {
    notFound();
  }

  if (!loan) {
    return (
      <main className="page-stack">
        <section className="panel empty-state empty-state--error">
          <h2>Could not load loan</h2>
          <p>{error}</p>
          <Link className="text-button" href="/loans">
            Back to loans
          </Link>
        </section>
      </main>
    );
  }

  const expectedDue = calculateExpectedDue(loan);
  const totalDue = calculateTotalDue(loan);
  const isClosed = loan.status === "closed";
  const todayDate = getTodayDateKey();

  return (
    <main className="page-stack">
      <Link className="back-link" href="/loans">
        Back to loans
      </Link>

      <PageHeader
        eyebrow={isClosed ? "Closed loan" : "Active loan"}
        title={loan.borrowerName}
        description={`${loan.paymentCycle} cycle - ${isClosed ? "closed" : "due"} ${loan.currentDueDate}`}
        action={
          <ReceivePaymentSheet
            disabled={isClosed}
            loanId={loan.id}
            totalDue={totalDue}
            unpaidInterest={loan.unpaidInterest}
          />
        }
      />

      <section className="loan-detail-status">
        <LoanStatusPill loan={loan} todayDate={todayDate} />
        <span>
          <DueDateLabel dueDate={loan.currentDueDate} todayDate={todayDate} />
        </span>
      </section>

      <section className="metric-grid" aria-label="Loan payment metrics">
        <MetricCard label="Current Due" tone="gold" value={money.format(totalDue)} />
        <MetricCard label="Expected Due" value={money.format(expectedDue)} />
        <MetricCard label="Unpaid Interest" value={money.format(loan.unpaidInterest)} />
        <MetricCard label="Credit Balance" value={money.format(loan.creditBalance)} />
      </section>

      {isClosed ? (
        <section className="panel empty-state">
          <h2>Payments disabled</h2>
          <p>Closed loans are read-only and cannot receive payments.</p>
        </section>
      ) : null}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Payment history</h2>
            <p>Actual received payments, partials, and overpayments.</p>
          </div>
          <span className="status-pill">{payments.length} records</span>
        </div>
        {error ? (
          <div className="empty-state empty-state--error">
            <h3>Could not load history</h3>
            <p>{error}</p>
          </div>
        ) : (
          <PaymentTimeline payments={payments} />
        )}
      </section>

      {!isClosed ? (
        <div className="mobile-sticky-cta">
          <ReceivePaymentSheet
            loanId={loan.id}
            totalDue={totalDue}
            unpaidInterest={loan.unpaidInterest}
          />
        </div>
      ) : null}
    </main>
  );
}
