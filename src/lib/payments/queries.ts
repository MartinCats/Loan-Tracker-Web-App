import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapLoanRow, type LoanRow } from "@/lib/loans/types";
import { isPreviewMode } from "@/lib/preview";
import { previewLoans, previewPayments } from "@/lib/preview-data";
import {
  mapPaymentHistoryRow,
  type PaymentHistoryRow,
} from "@/lib/payments/types";

async function getAuthenticatedSupabase() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/sign-in");
  }

  return { supabase, user };
}

export async function getLoanDetail(loanId: string) {
  if (isPreviewMode()) {
    const loan = previewLoans.find((item) => item.id === loanId);

    return {
      loan: loan ?? null,
      payments: previewPayments
        .filter((payment) => payment.loanId === loanId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      error: loan ? undefined : "Preview loan not found.",
    };
  }

  const { supabase, user } = await getAuthenticatedSupabase();

  const { data: loanData, error: loanError } = await supabase
    .from("loans")
    .select(
      "id,user_id,borrower_name,principal,interest_rate,payment_cycle,current_due_date,accumulated_profit,unpaid_interest,credit_balance,status,created_at,updated_at",
    )
    .eq("id", loanId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (loanError) {
    return {
      loan: null,
      payments: [],
      error: loanError.message,
    };
  }

  if (!loanData) {
    return {
      loan: null,
      payments: [],
      error: "Loan not found.",
    };
  }

  const { data: paymentData, error: paymentError } = await supabase
    .from("payment_histories")
    .select("id,user_id,loan_id,type,amount,note,created_at")
    .eq("loan_id", loanId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return {
    loan: mapLoanRow(loanData as LoanRow),
    payments: ((paymentData ?? []) as PaymentHistoryRow[]).map(
      mapPaymentHistoryRow,
    ),
    error: paymentError?.message,
  };
}
