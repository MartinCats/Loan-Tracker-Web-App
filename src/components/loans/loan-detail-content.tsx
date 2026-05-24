"use client";

import { useState } from "react";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { CloseLoanButton } from "@/components/loans/close-loan-button";
import { DeleteLoanButton } from "@/components/loans/delete-loan-button";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { RescheduleLoanSheet } from "@/components/loans/reschedule-loan-sheet";
import { ReceivePaymentSheet } from "@/components/payments/receive-payment-sheet";
import { PaymentTimeline } from "@/components/payments/payment-timeline";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
import { formatPaymentCycle } from "@/lib/loans/payment-cycle";
import { formatDueLabel } from "@/lib/loans/urgency";
import {
  calculateCreditApplied,
  calculateExpectedDue,
  calculateGrossDue,
  calculateTotalDue,
} from "@/lib/payments/calculator";
import type { Loan, PaymentHistory } from "@/lib/types/loan";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

type LoanDetailContentProps = {
  error?: string;
  initialLoan?: Loan;
  loanId?: string;
  payments: PaymentHistory[];
  todayDate: string;
};

export function LoanDetailContent({
  error,
  initialLoan,
  loanId,
  payments,
  todayDate,
}: LoanDetailContentProps) {
  const previewStore = usePreviewStore();
  const [isCycleUpdated, setIsCycleUpdated] = useState(false);
  const activeLoanId = initialLoan?.id ?? loanId;
  const loan =
    previewStore?.loans.find((item) => item.id === activeLoanId) ?? initialLoan;
  const visiblePayments = previewStore
    ? previewStore.payments
        .filter((payment) => payment.loanId === activeLoanId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : payments;
  const displayError = previewStore && loan ? undefined : error;

  if (!loan) {
    return (
      <main className="page-stack">
        <section className="panel empty-state empty-state--error">
          <h2>Could not load loan</h2>
          <p>
            {displayError ??
              "Preview loan data is no longer available after refresh."}
          </p>
        </section>
      </main>
    );
  }
  const expectedDue = calculateExpectedDue(loan);
  const grossDue = calculateGrossDue(loan);
  const creditApplied = calculateCreditApplied(loan);
  const totalDue = calculateTotalDue(loan);
  const isClosed = loan.status === "closed";
  const paymentCycle = formatPaymentCycle(loan.paymentCycle);
  const dueLabel = formatDueLabel(loan.currentDueDate, todayDate);
  const closedDate = getClosedDate(loan, visiblePayments);
  function handlePaymentRecorded(details: { nextDueDate?: string }) {
    if (!details.nextDueDate) {
      return;
    }

    setIsCycleUpdated(true);
    window.setTimeout(() => setIsCycleUpdated(false), 1600);
  }

  if (isClosed) {
    return (
      <main className="page-stack loan-detail-stack">
        <PageHeader
          eyebrow="Closed loan"
          title={loan.borrowerName}
          description={`${paymentCycle} cycle - Closed${
            closedDate ? ` ${closedDate}` : ""
          }`}
        />

        <section className="loan-detail-status">
          <LoanStatusPill loan={loan} todayDate={todayDate} />
          <span>{closedDate ? `Closed ${closedDate}` : "Read-only history"}</span>
        </section>

        <section className="panel loan-overview" aria-label="Loan overview">
          <div className="section-heading">
            <div>
              <h2>Loan overview</h2>
              <p>Original loan terms.</p>
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
            <div className="overview-item">
              <span>Status</span>
              <strong className="cycle-pill cycle-pill--large">Closed</strong>
            </div>
          </div>
        </section>

        <section className="panel balance-section" aria-label="Final summary">
          <div className="section-heading">
            <div>
              <h2>Final summary</h2>
              <p>Historical totals for this borrower.</p>
            </div>
          </div>
          <div className="balance-grid">
            <div className="balance-card balance-card--primary">
              <span>Total Profit</span>
              <strong>{money.format(loan.accumulatedProfit)}</strong>
            </div>
            <div className="balance-card">
              <span>Payment Records</span>
              <strong>{visiblePayments.length}</strong>
            </div>
            <div className="balance-card">
              <span>Credit Balance</span>
              <strong>{money.format(loan.creditBalance)}</strong>
            </div>
            <div className="balance-card">
              <span>Closed Date</span>
              <strong>{closedDate ?? "Not recorded"}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Payment history</h2>
              <p>Recorded payments preserved for review.</p>
            </div>
            <span className="status-pill">{visiblePayments.length} records</span>
          </div>
          {displayError ? (
            <div className="empty-state empty-state--error">
              <h3>Could not load history</h3>
              <p>{displayError}</p>
            </div>
          ) : (
            <PaymentTimeline payments={visiblePayments} />
          )}
        </section>

        <section className="panel danger-zone-panel">
          <div className="section-heading">
            <div>
              <h2>Danger zone</h2>
              <p>Permanent removal for unwanted or mistaken loans.</p>
            </div>
          </div>
          <DeleteLoanButton afterDeleteHref="/archive" loanId={loan.id} />
        </section>
      </main>
    );
  }

  return (
    <main className="page-stack loan-detail-stack">
      <PageHeader
        eyebrow={isClosed ? "Closed loan" : "Active loan"}
        title={loan.borrowerName}
        description={`${paymentCycle} cycle - ${isClosed ? "Closed" : "Due"} ${
          loan.currentDueDate
        }`}
      />

      <section
        className={`loan-detail-status${isCycleUpdated ? " is-updated" : ""}`}
      >
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
            {creditApplied > 0 ? (
              <small>Credit applied: {money.format(creditApplied)}</small>
            ) : null}
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

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Payment history</h2>
            <p>Actual received payments, partials, and overpayments.</p>
          </div>
          <span className="status-pill">{visiblePayments.length} records</span>
        </div>
        {displayError ? (
          <div className="empty-state empty-state--error">
            <h3>Could not load history</h3>
            <p>{displayError}</p>
          </div>
        ) : (
          <PaymentTimeline payments={visiblePayments} />
        )}
      </section>

      <section className="panel quick-action-panel">
        <div className="section-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Payment and due-date actions</p>
          </div>
        </div>
        <div className="quick-action-grid">
          <ReceivePaymentSheet
            creditApplied={creditApplied}
            grossDue={grossDue}
            label="Receive payment"
            loanId={loan.id}
            onPaymentRecorded={handlePaymentRecorded}
            totalDue={totalDue}
            triggerVariant="card"
            unpaidInterest={loan.unpaidInterest}
          />
          <RescheduleLoanSheet
            loanId={loan.id}
            currentDueDate={loan.currentDueDate}
            triggerVariant="card"
          />
          <CloseLoanButton loanId={loan.id} triggerVariant="card" />
        </div>
      </section>

      <section className="panel danger-zone-panel">
        <div className="section-heading">
          <div>
            <h2>Danger zone</h2>
            <p>Permanent removal for unwanted or mistaken loans.</p>
          </div>
        </div>
        <DeleteLoanButton
          afterDeleteHref={isClosed ? "/archive" : "/dashboard"}
          loanId={loan.id}
        />
      </section>
    </main>
  );
}

function getClosedDate(loan: Loan, payments: PaymentHistory[]) {
  const closedPayment = payments.find((payment) => payment.type === "loan_closed");
  const date = closedPayment?.createdAt ?? loan.updatedAt;

  return formatHistoryDate(date);
}

function formatHistoryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
