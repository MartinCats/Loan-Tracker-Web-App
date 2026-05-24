"use client";

import Link from "next/link";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { useLoanCardNavigation } from "@/components/loans/use-loan-card-navigation";
import { formatDueLabel } from "@/lib/loans/urgency";
import { calculateCreditApplied, calculateTotalDue } from "@/lib/payments/calculator";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { Loan } from "@/lib/types/loan";

export function DashboardDueCard({
  loan,
  todayDate,
}: {
  loan: Loan;
  todayDate: string;
}) {
  const { t } = useI18n();
  const detailHref = `/loans/${loan.id}`;
  const { isOpening, isPressed, linkProps } = useLoanCardNavigation(detailHref);
  const currentDue = calculateTotalDue(loan);
  const creditApplied = calculateCreditApplied(loan);

  return (
    <article
      className={cn(
        "dashboard-due-card loan-row--interactive",
        isPressed && "is-pressed",
        isOpening && "is-opening",
      )}
      data-loan-id={loan.id}
    >
      <Link
        className="dashboard-due-card__link"
        href={detailHref}
        {...linkProps}
      >
        <div className="dashboard-due-card__main">
          <h3>{loan.borrowerName}</h3>
          <p>{formatDueLabel(loan.currentDueDate, todayDate)}</p>
          <strong>{formatMoney(currentDue)} {t("loanCard.currentDue")}</strong>
          {currentDue === 0 && creditApplied > 0 ? (
            <small>{t("loanCard.creditCovers")}</small>
          ) : null}
        </div>

        <div className="dashboard-due-card__side">
          <LoanStatusPill loan={loan} todayDate={todayDate} />
          <span>{formatDueDate(loan.currentDueDate)}</span>
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
