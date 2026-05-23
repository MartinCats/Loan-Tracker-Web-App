import type { DashboardMetrics, Loan, LoanStatus, PaymentCycle } from "@/lib/types/loan";

export type LoanRow = {
  id: string;
  user_id: string;
  borrower_name: string;
  principal: number | string;
  interest_rate: number | string;
  payment_cycle: PaymentCycle;
  current_due_date: string;
  accumulated_profit: number | string;
  unpaid_interest: number | string;
  credit_balance: number | string;
  status: LoanStatus;
  created_at: string;
  updated_at: string;
};

export type LoanInsert = {
  user_id: string;
  borrower_name: string;
  principal: number;
  interest_rate: number;
  payment_cycle: PaymentCycle;
  current_due_date: string;
  accumulated_profit?: number;
  unpaid_interest?: number;
  credit_balance?: number;
  status?: LoanStatus;
};

export type CreateLoanInput = {
  borrowerName: string;
  principal: number;
  interestRate: number;
  paymentCycle: PaymentCycle;
  currentDueDate: string;
};

export type LoanListResult = {
  loans: Loan[];
  error?: string;
};

export type LoanDashboardResult = LoanListResult & {
  metrics: DashboardMetrics;
};

export function mapLoanRow(row: LoanRow): Loan {
  return {
    id: row.id,
    userId: row.user_id,
    borrowerName: row.borrower_name,
    principal: Number(row.principal),
    interestRate: Number(row.interest_rate),
    paymentCycle: row.payment_cycle,
    currentDueDate: row.current_due_date,
    accumulatedProfit: Number(row.accumulated_profit),
    unpaidInterest: Number(row.unpaid_interest),
    creditBalance: Number(row.credit_balance),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
