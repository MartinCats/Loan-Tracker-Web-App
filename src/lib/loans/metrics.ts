import type { DashboardMetrics, Loan } from "@/lib/types/loan";

export function calculateExpectedProfit(loan: Loan) {
  return loan.principal * (loan.interestRate / 100);
}

export function calculateDashboardMetrics(loans: Loan[]): DashboardMetrics {
  const activeLoans = loans.filter((loan) => loan.status === "active");

  return {
    lifetimeProfit: loans.reduce(
      (total, loan) => total + loan.accumulatedProfit,
      0,
    ),
    expectedProfit: activeLoans.reduce(
      (total, loan) => total + calculateExpectedProfit(loan),
      0,
    ),
    principalActive: activeLoans.reduce(
      (total, loan) => total + loan.principal,
      0,
    ),
    activeLoans: activeLoans.length,
  };
}
