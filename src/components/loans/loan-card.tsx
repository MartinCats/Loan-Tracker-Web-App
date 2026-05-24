"use client";

import Link from "next/link";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { useLoanCardNavigation } from "@/components/loans/use-loan-card-navigation";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { Loan } from "@/lib/types/loan";
import {
  calculateCreditApplied,
  calculateTotalDue,
} from "@/lib/payments/calculator";

type LoanCardProps = {
  loan: Loan;
  mode: "active" | "archive";
  todayDate: string;
};

export function LoanCard({ loan, mode, todayDate }: LoanCardProps) {
  const { t } = useI18n();
  const currentDue = calculateTotalDue(loan);
  const creditApplied = calculateCreditApplied(loan);
  const detailHref = mode === "archive" ? `/archive/${loan.id}` : `/loans/${loan.id}`;
  const { isOpening, isPressed, linkProps } = useLoanCardNavigation(detailHref);
  const amountLabel = mode === "archive" ? t("loanCard.profit") : t("loanCard.currentDue");
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
          {t(`cycle.${loan.paymentCycle}` as MessageKey)} -{" "}
          <DueDateLabel dueDate={loan.currentDueDate} todayDate={todayDate} />
          {mode === "active" ? (
            <span> - Due {formatDueDate(loan.currentDueDate)}</span>
          ) : null}
        </p>

        <div className="loan-row__bottom">
          <span>
            {amountLabel}
            {mode === "active" && currentDue === 0 && creditApplied > 0 ? (
              <small>{t("loanCard.creditCovers")}</small>
            ) : null}
          </span>
          <strong>{formatMoney(amount)}</strong>
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
