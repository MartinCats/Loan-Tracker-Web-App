export type LoanStatus = "active" | "closed";

export type PaymentCycle = "weekly" | "biweekly" | "monthly";

export type Loan = {
  id: string;
  userId: string;
  borrowerName: string;
  principal: number;
  interestRate: number;
  paymentCycle: PaymentCycle;
  currentDueDate: string;
  accumulatedProfit: number;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentHistory = {
  id: string;
  userId: string;
  loanId: string;
  type: "payment" | "reschedule" | "close";
  amount: number;
  note?: string;
  createdAt: string;
};

export type DashboardMetrics = {
  lifetimeProfit: number;
  expectedProfit: number;
  principalActive: number;
  activeLoans: number;
};
