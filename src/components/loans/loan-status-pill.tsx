"use client";

import { getLoanUrgency, getUrgencyLabel } from "@/lib/loans/urgency";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { Loan } from "@/lib/types/loan";

export function LoanStatusPill({
  loan,
  todayDate,
}: {
  loan: Loan;
  todayDate: string;
}) {
  const { t } = useI18n();

  if (loan.status === "closed") {
    return <span className="loan-status loan-status--healthy">{t("status.closed")}</span>;
  }

  const urgency = getLoanUrgency(loan, todayDate);
  const label =
    urgency === "healthy"
      ? t("status.healthy")
      : urgency === "due-soon"
        ? t("status.dueSoon")
        : urgency === "overdue"
          ? t("status.overdue")
          : getUrgencyLabel(urgency);

  return (
    <span className={`loan-status loan-status--${urgency}`}>
      {label}
    </span>
  );
}
