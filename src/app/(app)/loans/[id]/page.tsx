import { notFound } from "next/navigation";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { RescheduleLoanSheet } from "@/components/loans/reschedule-loan-sheet";
import { ReceivePaymentSheet } from "@/components/payments/receive-payment-sheet";
import { PaymentTimeline } from "@/components/payments/payment-timeline";
import { PageHeader } from "@/components/ui/page-header";
import { formatPaymentCycle } from "@/lib/loans/payment-cycle";
import { formatDueLabel, getTodayDateKey } from "@/lib/loans/urgency";
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
        </section>
      </main>
    );
  }

  const expectedDue = calculateExpectedDue(loan);
  const totalDue = calculateTotalDue(loan);
  const isClosed = loan.status === "closed";
  const todayDate = getTodayDateKey();
  const paymentCycle = formatPaymentCycle(loan.paymentCycle);
  const dueLabel = formatDueLabel(loan.currentDueDate, todayDate);

  return (
    <main className="page-stack loan-detail-stack">
      <PageHeader
        eyebrow={isClosed ? "Closed loan" : "Active loan"}
        title={loan.borrowerName}
        description={`${paymentCycle} cycle - ${isClosed ? "Closed" : "Due"} ${
          loan.currentDueDate
        }`}
      />

      <section className="loan-detail-status">
        <LoanStatusPill loan={loan} todayDate={todayDate} />
        <span>{dueLabel}</span>
      </section>

      <section className="panel loan-overview" aria-label="Loan overview">
        <div className="section-heading">
          <div>
            <h2>Loan overview</h2>
            <p>Core loan terms.</p>
          </div>
        </div>
        <div className="overview-grid">
          <div className="overview-item overview-item--strong">
            <span>Principal borrowed</span>
            <strong>{money.format(loan.principal)}</strong>
          </div>
          <div className="overview-item">
            <span>Interest rate</span>
            <strong>{loan.interestRate}%</strong>
          </div>
          <div className="overview-item">
            <span>Payment cycle</span>
            <strong className="cycle-pill cycle-pill--large">{paymentCycle}</strong>
          </div>
        </div>
      </section>

      <section className="panel balance-section" aria-label="Current balances">
        <div className="section-heading">
          <div>
            <h2>Current balances</h2>
            <p>Due amounts and received profit.</p>
          </div>
        </div>
        <div className="balance-grid">
          <div className="balance-card balance-card--primary">
            <span>Current Due</span>
            <strong>{money.format(totalDue)}</strong>
          </div>
          <div className="balance-card">
            <span>Expected Due</span>
            <strong>{money.format(expectedDue)}</strong>
          </div>
          <div className="balance-card">
            <span>Unpaid Interest</span>
            <strong>{money.format(loan.unpaidInterest)}</strong>
          </div>
          <div className="balance-card">
            <span>Credit Balance</span>
            <strong>{money.format(loan.creditBalance)}</strong>
          </div>
          <div className="balance-card">
            <span>Accumulated Profit</span>
            <strong>{money.format(loan.accumulatedProfit)}</strong>
          </div>
        </div>
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
        <section className="panel quick-action-panel">
          <div className="section-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Payment and due-date actions</p>
            </div>
          </div>
          <ReceivePaymentSheet
            loanId={loan.id}
            totalDue={totalDue}
            unpaidInterest={loan.unpaidInterest}
          />
          <RescheduleLoanSheet
            loanId={loan.id}
            currentDueDate={loan.currentDueDate}
          />
        </section>
      ) : null}
    </main>
  );
}
