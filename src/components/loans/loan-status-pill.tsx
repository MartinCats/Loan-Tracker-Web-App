import { getLoanUrgency, getUrgencyLabel } from "@/lib/loans/urgency";
import type { Loan } from "@/lib/types/loan";

export function LoanStatusPill({
  loan,
  todayDate,
}: {
  loan: Loan;
  todayDate: string;
}) {
  const urgency = getLoanUrgency(loan, todayDate);

  return (
    <span className={`loan-status loan-status--${urgency}`}>
      {getUrgencyLabel(urgency)}
    </span>
  );
}
