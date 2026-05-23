import type { Loan, PaymentHistoryType } from "@/lib/types/loan";

export type PaymentCalculation = {
  expectedDue: number;
  totalDue: number;
  interestReceived: number;
  unpaidInterest: number;
  creditBalance: number;
  accumulatedProfit: number;
  historyType: PaymentHistoryType;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateExpectedDue(loan: Loan) {
  return roundMoney(loan.principal * (loan.interestRate / 100));
}

export function calculateTotalDue(loan: Loan) {
  return roundMoney(loan.unpaidInterest + calculateExpectedDue(loan));
}

export function calculatePayment(loan: Loan, amount: number): PaymentCalculation {
  const expectedDue = calculateExpectedDue(loan);
  const totalDue = calculateTotalDue(loan);
  const interestReceived = roundMoney(Math.min(amount, totalDue));
  const overpayment = roundMoney(Math.max(amount - totalDue, 0));
  const unpaidInterest = roundMoney(Math.max(totalDue - amount, 0));
  let historyType: PaymentHistoryType = "payment_received";

  if (amount < totalDue) {
    historyType = "partial_payment";
  } else if (amount > totalDue) {
    historyType = "overpayment";
  }

  return {
    expectedDue,
    totalDue,
    interestReceived,
    unpaidInterest,
    creditBalance: roundMoney(loan.creditBalance + overpayment),
    accumulatedProfit: roundMoney(loan.accumulatedProfit + interestReceived),
    historyType,
  };
}
