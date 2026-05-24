import type { PaymentHistory, PaymentHistoryType } from "@/lib/types/loan";

export type PaymentHistoryRow = {
  id: string;
  user_id: string;
  loan_id: string;
  type: PaymentHistoryType;
  amount: number | string;
  note: string | null;
  created_at: string;
};

export type PaymentHistoryInsert = {
  user_id: string;
  loan_id: string;
  type: PaymentHistoryType;
  amount: number;
  note?: string | null;
};

export type ReceivePaymentInput = {
  loanId: string;
  amount: number;
  note?: string;
};

export type PaymentActionState = {
  status: "idle" | "error" | "success";
  message: string;
  nextDueDate?: string;
};

export function mapPaymentHistoryRow(row: PaymentHistoryRow): PaymentHistory {
  return {
    id: row.id,
    userId: row.user_id,
    loanId: row.loan_id,
    type: row.type,
    amount: Number(row.amount),
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}
