"use client";

import { useCallback, useRef, useState } from "react";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { CloseLoanButton } from "@/components/loans/close-loan-button";
import { DeleteLoanButton } from "@/components/loans/delete-loan-button";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { RescheduleLoanSheet } from "@/components/loans/reschedule-loan-sheet";
import { ReceivePaymentSheet } from "@/components/payments/receive-payment-sheet";
import { PaymentTimeline } from "@/components/payments/payment-timeline";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
import { formatMoney } from "@/lib/format/money";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";
import { formatDueLabel } from "@/lib/loans/urgency";
import {
  calculateCreditApplied,
  calculateExpectedDue,
  calculateGrossDue,
  calculateTotalDue,
} from "@/lib/payments/calculator";
import type { Loan, PaymentHistory } from "@/lib/types/loan";

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
  const { t } = useI18n();
  const previewStore = usePreviewStore();
  const [isCycleUpdated, setIsCycleUpdated] = useState(false);
  const dueStatusRef = useRef<HTMLElement | null>(null);
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
          <h2>{t("detail.couldNotLoadLoan")}</h2>
          <p>
            {displayError ??
            t("detail.previewMissing")}
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
  const paymentCycle = t(`cycle.${loan.paymentCycle}` as MessageKey);
  const dueLabel = formatDueLabel(loan.currentDueDate, todayDate);
  const closedDate = getClosedDate(loan, visiblePayments);
  const emphasizeDueStatus = useCallback((options: { shouldScroll?: boolean } = {}) => {
    setIsCycleUpdated(true);

    if (options.shouldScroll) {
      window.requestAnimationFrame(() => {
        dueStatusRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      });
    }

    window.setTimeout(() => setIsCycleUpdated(false), 1100);
  }, []);
  const handlePaymentRecorded = useCallback((details: { nextDueDate?: string }) => {
    if (!details.nextDueDate) {
      return;
    }

    emphasizeDueStatus();
  }, [emphasizeDueStatus]);
  const handleRescheduled = useCallback(() => {
    emphasizeDueStatus({ shouldScroll: true });
  }, [emphasizeDueStatus]);

  if (isClosed) {
    return (
      <main className="page-stack loan-detail-stack">
        <PageHeader
          eyebrow={t("detail.closedLoan")}
          title={loan.borrowerName}
          description={`${paymentCycle} - ${t("common.closed")}${
            closedDate ? ` ${closedDate}` : ""
          }`}
        />

        <section className="loan-detail-status">
          <LoanStatusPill loan={loan} todayDate={todayDate} />
          <span>{closedDate ? `${t("common.closed")} ${closedDate}` : t("detail.readOnlyHistory")}</span>
        </section>

        <section className="panel loan-overview" aria-label={t("detail.loanOverview")}>
          <div className="section-heading">
            <div>
              <h2>{t("detail.loanOverview")}</h2>
              <p>{t("detail.originalTerms")}</p>
            </div>
          </div>
          <div className="overview-grid">
            <div className="overview-item overview-item--strong">
              <span>{t("detail.principalBorrowed")}</span>
              <strong>{formatMoney(loan.principal)}</strong>
            </div>
            <div className="overview-item">
              <span>{t("detail.interestRate")}</span>
              <strong>{loan.interestRate}%</strong>
            </div>
            <div className="overview-item">
              <span>{t("detail.paymentCycle")}</span>
              <strong className="cycle-pill cycle-pill--large">{paymentCycle}</strong>
            </div>
            <div className="overview-item">
              <span>{t("common.status")}</span>
              <strong className="cycle-pill cycle-pill--large">{t("common.closed")}</strong>
            </div>
          </div>
        </section>

        <section className="panel balance-section" aria-label="Final summary">
          <div className="section-heading">
            <div>
              <h2>{t("detail.finalSummary")}</h2>
              <p>{t("detail.finalSummaryDescription")}</p>
            </div>
          </div>
          <div className="balance-grid">
            <div className="balance-card balance-card--primary">
              <span>{t("detail.totalProfit")}</span>
              <strong>{formatMoney(loan.accumulatedProfit)}</strong>
            </div>
            <div className="balance-card">
              <span>{t("detail.paymentRecords")}</span>
              <strong>{visiblePayments.length}</strong>
            </div>
            <div className="balance-card">
              <span>{t("detail.creditBalance")}</span>
              <strong>{formatMoney(loan.creditBalance)}</strong>
            </div>
            <div className="balance-card">
              <span>{t("detail.closedDate")}</span>
              <strong>{closedDate ?? t("detail.notRecorded")}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>{t("detail.paymentHistory")}</h2>
              <p>{t("detail.paymentHistoryClosedDescription")}</p>
            </div>
            <span className="status-pill">{visiblePayments.length} {t("common.records")}</span>
          </div>
          {displayError ? (
            <div className="empty-state empty-state--error">
              <h3>{t("detail.couldNotLoadHistory")}</h3>
              <p>{displayError}</p>
            </div>
          ) : (
            <PaymentTimeline payments={visiblePayments} />
          )}
        </section>

        <section className="panel danger-zone-panel">
          <div className="section-heading">
            <div>
              <h2>{t("detail.dangerZone")}</h2>
              <p>{t("detail.dangerDescription")}</p>
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
        eyebrow={isClosed ? t("detail.closedLoan") : t("detail.activeLoan")}
        title={loan.borrowerName}
        description={`${paymentCycle} - ${isClosed ? t("common.closed") : t("loanCard.currentDue")} ${
          loan.currentDueDate
        }`}
      />

      <section
        className={`loan-detail-status${isCycleUpdated ? " is-updated" : ""}`}
        ref={dueStatusRef}
      >
        <LoanStatusPill loan={loan} todayDate={todayDate} />
        <span>{dueLabel}</span>
      </section>

      <section className="panel loan-overview" aria-label={t("detail.loanOverview")}>
        <div className="section-heading">
          <div>
            <h2>{t("detail.loanOverview")}</h2>
            <p>{t("detail.coreTerms")}</p>
          </div>
        </div>
        <div className="overview-grid">
          <div className="overview-item overview-item--strong">
            <span>{t("detail.principalBorrowed")}</span>
            <strong>{formatMoney(loan.principal)}</strong>
          </div>
          <div className="overview-item">
            <span>{t("detail.interestRate")}</span>
            <strong>{loan.interestRate}%</strong>
          </div>
          <div className="overview-item">
            <span>{t("detail.paymentCycle")}</span>
            <strong className="cycle-pill cycle-pill--large">{paymentCycle}</strong>
          </div>
        </div>
      </section>

      <section className="panel balance-section" aria-label={t("detail.currentBalances")}>
        <div className="section-heading">
          <div>
            <h2>{t("detail.currentBalances")}</h2>
            <p>{t("detail.balancesDescription")}</p>
          </div>
        </div>
        <div className="balance-grid">
          <div className="balance-card balance-card--primary">
            <span>{t("detail.currentDue")}</span>
            <strong>{formatMoney(totalDue)}</strong>
            {creditApplied > 0 ? (
              <small>{t("detail.creditApplied")}: {formatMoney(creditApplied)}</small>
            ) : null}
          </div>
          <div className="balance-card">
            <span>{t("detail.expectedDue")}</span>
            <strong>{formatMoney(expectedDue)}</strong>
          </div>
          <div className="balance-card">
            <span>{t("detail.unpaidInterest")}</span>
            <strong>{formatMoney(loan.unpaidInterest)}</strong>
          </div>
          <div className="balance-card">
            <span>{t("detail.creditBalance")}</span>
            <strong>{formatMoney(loan.creditBalance)}</strong>
          </div>
          <div className="balance-card">
            <span>{t("detail.accumulatedProfit")}</span>
            <strong>{formatMoney(loan.accumulatedProfit)}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>{t("detail.paymentHistory")}</h2>
            <p>{t("detail.paymentHistoryActiveDescription")}</p>
          </div>
          <span className="status-pill">{visiblePayments.length} {t("common.records")}</span>
        </div>
        {displayError ? (
          <div className="empty-state empty-state--error">
            <h3>{t("detail.couldNotLoadHistory")}</h3>
            <p>{displayError}</p>
          </div>
        ) : (
          <PaymentTimeline payments={visiblePayments} />
        )}
      </section>

      <section className="panel quick-action-panel">
        <div className="section-heading">
          <div>
            <h2>{t("detail.quickActions")}</h2>
            <p>{t("detail.quickActionsDescription")}</p>
          </div>
        </div>
        <div className="quick-action-grid">
          <ReceivePaymentSheet
            creditApplied={creditApplied}
            grossDue={grossDue}
            label={t("receive.title")}
            loanId={loan.id}
            onPaymentRecorded={handlePaymentRecorded}
            totalDue={totalDue}
            triggerVariant="card"
            unpaidInterest={loan.unpaidInterest}
          />
          <RescheduleLoanSheet
            loanId={loan.id}
            currentDueDate={loan.currentDueDate}
            onRescheduled={handleRescheduled}
            triggerVariant="card"
          />
          <CloseLoanButton loan={loan} triggerVariant="card" />
        </div>
      </section>

      <section className="panel danger-zone-panel">
        <div className="section-heading">
          <div>
            <h2>{t("detail.dangerZone")}</h2>
            <p>{t("detail.dangerDescription")}</p>
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
