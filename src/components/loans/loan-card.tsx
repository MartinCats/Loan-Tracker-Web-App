import Link from "next/link";
import { DueDateLabel } from "@/components/loans/due-date-label";
import { LoanStatusPill } from "@/components/loans/loan-status-pill";
import type { Loan } from "@/lib/types/loan";
import { ArchiveLoanButton } from "@/components/loans/archive-loan-button";

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
  return (
    <article className="loan-row loan-row--tall loan-row--interactive">
      <Link className="loan-row__link" href={`/loans/${loan.id}`}>
        <h3>
          {loan.borrowerName}
        </h3>
        <p>
          {loan.paymentCycle} -{" "}
          <DueDateLabel dueDate={loan.currentDueDate} todayDate={todayDate} />
        </p>
        {mode === "active" && loan.unpaidInterest > 0 ? (
          <p>{money.format(loan.unpaidInterest)} unpaid interest</p>
        ) : null}
      </Link>
      <div className="loan-row__meta">
        {mode === "active" ? <LoanStatusPill loan={loan} todayDate={todayDate} /> : null}
        <span>{mode === "archive" ? "Profit" : "Principal"}</span>
        <strong>
          {money.format(
            mode === "archive" ? loan.accumulatedProfit : loan.principal,
          )}
        </strong>
        {mode === "active" ? <ArchiveLoanButton loanId={loan.id} /> : null}
      </div>
    </article>
  );
}
