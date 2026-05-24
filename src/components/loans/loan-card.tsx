"use client";

import Link from "next/link";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { useLoanCardNavigation } from "@/components/loans/use-loan-card-navigation";
import { formatPaymentCycle } from "@/lib/loans/payment-cycle";
import { cn } from "@/lib/cn";
import type { Loan } from "@/lib/types/loan";
import {
  calculateCreditApplied,
  calculateTotalDue,
} from "@/lib/payments/calculator";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type LoanCardProps = {
  loan: Loan;
  mode: "active" | "archive";
  todayDate: string;
};

export function LoanCard({ loan, mode, todayDate }: LoanCardProps) {
  const currentDue = calculateTotalDue(loan);
  const creditApplied = calculateCreditApplied(loan);
  const detailHref = mode === "archive" ? `/archive/${loan.id}` : `/loans/${loan.id}`;
  const { isOpening, isPressed, linkProps } = useLoanCardNavigation(detailHref);
  const amountLabel = mode === "archive" ? "Profit" : "Current due";
  const amount = mode === "archive" ? loan.accumulatedProfit : currentDue;

  return (
    <article
      className={cn(
        "loan-row loan-row--interactive",
        isPressed && "is-pressed",
        isOpening && "is-opening",
      )}
      data-loan-id={loan.id}
    >
      <Link
        className="loan-row__link"
        href={detailHref}
        {...linkProps}
      >
        <div className="loan-row__top">
          <h3>{loan.borrowerName}</h3>
          <LoanStatusPill loan={loan} todayDate={todayDate} />
        </div>

        <p className="loan-row__terms">
          {formatPaymentCycle(loan.paymentCycle)} cycle -{" "}
          <DueDateLabel dueDate={loan.currentDueDate} todayDate={todayDate} />
          {mode === "active" ? (
            <span> - Due {formatDueDate(loan.currentDueDate)}</span>
          ) : null}
        </p>

        <div className="loan-row__bottom">
          <span>
            {amountLabel}
            {mode === "active" && currentDue === 0 && creditApplied > 0 ? (
              <small>Credit covers this cycle</small>
            ) : null}
          </span>
          <strong>{money.format(amount)}</strong>
        </div>
      </Link>
    </article>
  );
}

function formatDueDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
