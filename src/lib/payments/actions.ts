"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getActiveOrDefaultLenderProfile } from "@/lib/lender-profiles/default-profile";
import { mapLoanRow, type LoanRow } from "@/lib/loans/types";
import { calculatePayment } from "@/lib/payments/calculator";
import { isPreviewMode } from "@/lib/preview";
import type {
  PaymentActionState,
  PaymentHistoryInsert,
  ReceivePaymentInput,
} from "@/lib/payments/types";
import { createClient } from "@/lib/supabase/server";

type AuthenticatedSupabase =
  | {
      supabase: SupabaseClient;
      user: User;
    }
  | {
      error: string;
    };

function getNumberValue(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) ? value : null;
}

function parseReceivePayment(formData: FormData):
  | { ok: true; input: ReceivePaymentInput }
  | { ok: false; message: string } {
  const loanId = String(formData.get("loanId") ?? "");
  const amount = getNumberValue(formData, "amount");
  const note = String(formData.get("note") ?? "").trim();

  if (!loanId) {
    return { ok: false, message: "Loan is missing." };
  }

  if (amount === null || amount < 0) {
    return { ok: false, message: "Payment amount cannot be negative." };
  }

  return {
    ok: true,
    input: {
      loanId,
      amount,
      note: note || undefined,
    },
  };
}

async function getAuthenticatedSupabase(): Promise<AuthenticatedSupabase> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured. Add the public URL and anon key.",
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: "Sign in again before receiving a payment.",
    };
  }

  return { supabase, user };
}

function revalidatePaymentViews(loanId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/loans");
  revalidatePath("/archive");
  revalidatePath(`/loans/${loanId}`);
}

export async function receivePaymentAction(
  _prevState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview Mode: payment is simulated and not saved.",
    };
  }

  const parsed = parseReceivePayment(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { profile, error: profileError } =
    await getActiveOrDefaultLenderProfile(auth.supabase, auth.user);

  if (profileError || !profile) {
    return {
      status: "error",
      message: profileError ?? "Could not load lender profile.",
    };
  }

  const { data, error: loanError } = await auth.supabase
    .from("loans")
    .select(
      "id,user_id,lender_profile_id,borrower_name,principal,interest_rate,payment_cycle,current_due_date,accumulated_profit,unpaid_interest,credit_balance,status,created_at,updated_at",
    )
    .eq("id", parsed.input.loanId)
    .eq("user_id", auth.user.id)
    .eq("lender_profile_id", profile.id)
    .maybeSingle();

  if (loanError) {
    return { status: "error", message: loanError.message };
  }

  if (!data) {
    return { status: "error", message: "Loan not found." };
  }

  const loan = mapLoanRow(data as LoanRow);

  if (loan.status !== "active") {
    return { status: "error", message: "Closed loans cannot receive payments." };
  }

  const payment = calculatePayment(loan, parsed.input.amount);

  if (parsed.input.amount === 0 && payment.creditApplied <= 0) {
    return { status: "error", message: "Payment amount must be greater than zero." };
  }

  const historyRow: PaymentHistoryInsert = {
    user_id: auth.user.id,
    loan_id: loan.id,
    type: payment.historyType,
    amount: parsed.input.amount,
    note: parsed.input.note ?? null,
  };

  const { error: historyError } = await auth.supabase
    .from("payment_histories")
    .insert(historyRow);

  if (historyError) {
    return { status: "error", message: historyError.message };
  }

  const { error: updateError } = await auth.supabase
    .from("loans")
    .update({
      accumulated_profit: payment.accumulatedProfit,
      unpaid_interest: payment.unpaidInterest,
      credit_balance: payment.creditBalance,
      ...(payment.nextDueDate ? { current_due_date: payment.nextDueDate } : {}),
    })
    .eq("id", loan.id)
    .eq("user_id", auth.user.id)
    .eq("lender_profile_id", profile.id)
    .eq("status", "active");

  if (updateError) {
    return { status: "error", message: updateError.message };
  }

  revalidatePaymentViews(loan.id);

  return {
    status: "success",
    message: "Payment recorded.",
    nextDueDate: payment.nextDueDate ?? undefined,
  };
}
