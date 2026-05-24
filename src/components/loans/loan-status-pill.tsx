import { getLoanUrgency, getUrgencyLabel } from "@/lib/loans/urgency";
import type { Loan } from "@/lib/types/loan";

export function LoanStatusPill({
  loan,
  todayDate,
}: {
  loan: Loan;
  todayDate: string;
}) {
  if (loan.status === "closed") {
    return <span className="loan-status loan-status--healthy">Closed</span>;
  }

  const urgency = getLoanUrgency(loan, todayDate);

  return (
    <span className={`loan-status loan-status--${urgency}`}>
      {getUrgencyLabel(urgency)}
    </span>
  );
}
