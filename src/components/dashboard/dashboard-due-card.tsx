import Link from "next/link";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import { formatDueLabel } from "@/lib/loans/urgency";
import { calculateCreditApplied, calculateTotalDue } from "@/lib/payments/calculator";
import type { Loan } from "@/lib/types/loan";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DashboardDueCard({
  loan,
  todayDate,
}: {
  loan: Loan;
  todayDate: string;
}) {
  const currentDue = calculateTotalDue(loan);
  const creditApplied = calculateCreditApplied(loan);

  return (
    <article
      className="dashboard-due-card loan-row--interactive"
      data-loan-id={loan.id}
    >
      <Link className="dashboard-due-card__link" href={`/loans/${loan.id}`}>
        <div className="dashboard-due-card__main">
          <h3>{loan.borrowerName}</h3>
          <p>{formatDueLabel(loan.currentDueDate, todayDate)}</p>
          <strong>{money.format(currentDue)} due</strong>
          {currentDue === 0 && creditApplied > 0 ? (
            <small>Credit covers this cycle</small>
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
