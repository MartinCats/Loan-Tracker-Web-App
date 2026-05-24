import type { Loan, PaymentHistoryType } from "@/lib/types/loan";
import { advanceDueDateByCycle } from "@/lib/loans/due-date";

export type PaymentCalculation = {
  expectedDue: number;
  grossDue: number;
  creditApplied: number;
  totalDue: number;
  interestReceived: number;
  unpaidInterest: number;
  creditBalance: number;
  accumulatedProfit: number;
  historyType: PaymentHistoryType;
  isCurrentDueSatisfied: boolean;
  nextDueDate: string | null;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateExpectedDue(loan: Loan) {
  return roundMoney(loan.principal * (loan.interestRate / 100));
}

export function calculateGrossDue(loan: Loan) {
  return roundMoney(loan.unpaidInterest + calculateExpectedDue(loan));
}

export function calculateCreditApplied(loan: Loan) {
  return roundMoney(Math.min(loan.creditBalance, calculateGrossDue(loan)));
}

export function calculateTotalDue(loan: Loan) {
  return roundMoney(calculateGrossDue(loan) - calculateCreditApplied(loan));
}

export function calculatePayment(loan: Loan, amount: number): PaymentCalculation {
  const expectedDue = calculateExpectedDue(loan);
  const grossDue = calculateGrossDue(loan);
  const creditApplied = calculateCreditApplied(loan);
  const totalDue = calculateTotalDue(loan);
  const totalCovered = roundMoney(creditApplied + amount);
  const interestReceived = roundMoney(Math.min(totalCovered, grossDue));
  const overpayment = roundMoney(Math.max(amount - totalDue, 0));
  const unpaidInterest = roundMoney(Math.max(grossDue - totalCovered, 0));
  const isCurrentDueSatisfied = totalCovered >= grossDue;
  let historyType: PaymentHistoryType = "payment_received";

  if (amount < totalDue) {
    historyType = "partial_payment";
  } else if (amount > totalDue) {
    historyType = "overpayment";
  }

  return {
    expectedDue,
    grossDue,
    creditApplied,
    totalDue,
    interestReceived,
    unpaidInterest,
    creditBalance: roundMoney(loan.creditBalance - creditApplied + overpayment),
    accumulatedProfit: roundMoney(loan.accumulatedProfit + interestReceived),
    historyType,
    isCurrentDueSatisfied,
    nextDueDate: isCurrentDueSatisfied
      ? advanceDueDateByCycle(loan.currentDueDate, loan.paymentCycle)
      : null,
  };
}
