import type { Loan } from "@/lib/types/loan";
import { LoanCard } from "@/components/loans/loan-card";

type LoanListProps = {
  loans: Loan[];
  mode: "active" | "archive";
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  todayDate: string;
};

export function LoanList({
  loans,
  mode,
  emptyTitle,
  emptyDescription,
  emptyAction,
  todayDate,
}: LoanListProps) {
  if (loans.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
        {emptyAction ? <div className="empty-state__action">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <div className="loan-list">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} mode={mode} todayDate={todayDate} />
      ))}
    </div>
  );
}
