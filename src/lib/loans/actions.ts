"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { mapLoanRow, type CreateLoanInput, type LoanInsert, type LoanRow } from "@/lib/loans/types";
import { paymentCycleOptions } from "@/lib/loans/payment-cycle";
import { calculateCloseLoanSettlement } from "@/lib/payments/calculator";
import { isPreviewMode } from "@/lib/preview";
import type { PaymentCycle } from "@/lib/types/loan";

export type LoanActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

const paymentCycles: PaymentCycle[] = [
  ...paymentCycleOptions.map((option) => option.value),
  "biweekly",
];

function getNumberValue(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) ? value : null;
}

function parseCreateLoan(formData: FormData):
  | { ok: true; input: CreateLoanInput }
  | { ok: false; message: string } {
  const borrowerName = String(formData.get("borrowerName") ?? "").trim();
  const principal = getNumberValue(formData, "principal");
  const interestRate = getNumberValue(formData, "interestRate");
  const paymentCycle = String(formData.get("paymentCycle") ?? "");
  const currentDueDate = String(formData.get("currentDueDate") ?? "");

  if (!borrowerName) {
    return { ok: false, message: "Enter a borrower name." };
  }

  if (principal === null || principal <= 0) {
    return { ok: false, message: "Principal must be greater than zero." };
  }

  if (interestRate === null || interestRate < 0) {
    return { ok: false, message: "Interest rate must be zero or higher." };
  }

  if (!paymentCycles.includes(paymentCycle as PaymentCycle)) {
    return { ok: false, message: "Choose a valid payment cycle." };
  }

  if (!currentDueDate) {
    return { ok: false, message: "Choose a due date." };
  }

  return {
    ok: true,
    input: {
      borrowerName,
      principal,
      interestRate,
      paymentCycle: paymentCycle as PaymentCycle,
      currentDueDate,
    },
  };
}

function parseRescheduleLoan(formData: FormData):
  | { ok: true; input: { loanId: string; currentDueDate: string } }
  | { ok: false; message: string } {
  const loanId = String(formData.get("loanId") ?? "").trim();
  const currentDueDate = String(formData.get("currentDueDate") ?? "").trim();

  if (!loanId) {
    return { ok: false, message: "Loan is missing." };
  }

  if (!currentDueDate) {
    return { ok: false, message: "Choose the new due date." };
  }

  return {
    ok: true,
    input: {
      loanId,
      currentDueDate,
    },
  };
}

function parseCloseLoan(formData: FormData):
  | { ok: true; input: { amountReceived: number; loanId: string; note: string } }
  | { ok: false; message: string } {
  const loanId = String(formData.get("loanId") ?? "").trim();
  const amountReceived = getNumberValue(formData, "amountReceived");
  const note = String(formData.get("note") ?? "").trim();

  if (!loanId) {
    return { ok: false, message: "Loan is missing." };
  }

  if (amountReceived === null || amountReceived < 0) {
    return { ok: false, message: "Enter a valid settlement amount." };
  }

  return {
    ok: true,
    input: {
      amountReceived,
      loanId,
      note,
    },
  };
}

type AuthenticatedSupabase =
  | {
      supabase: SupabaseClient;
      user: User;
    }
  | {
      error: string;
    };

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
      error: "Sign in again before changing loans.",
    };
  }

  return { supabase, user };
}

function revalidateLoanViews() {
  revalidatePath("/dashboard");
  revalidatePath("/loans");
  revalidatePath("/archive");
}

function getSafePostDeleteHref(formData: FormData) {
  const href = String(formData.get("afterDeleteHref") ?? "").trim();

  if (href === "/archive" || href === "/loans" || href === "/dashboard") {
    return href;
  }

  return "/dashboard";
}

export async function createLoanAction(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview Mode: loan creation is simulated and not saved.",
    };
  }

  const parsed = parseCreateLoan(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const row: LoanInsert = {
    user_id: auth.user.id,
    borrower_name: parsed.input.borrowerName,
    principal: parsed.input.principal,
    interest_rate: parsed.input.interestRate,
    payment_cycle: parsed.input.paymentCycle,
    current_due_date: parsed.input.currentDueDate,
    status: "active",
    accumulated_profit: 0,
    unpaid_interest: 0,
    credit_balance: 0,
  };

  const { error } = await auth.supabase.from("loans").insert(row);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidateLoanViews();

  return { status: "success", message: "Loan created." };
}

export async function createLoanFormAction(formData: FormData) {
  await createLoanAction({ status: "idle", message: "" }, formData);
}

export async function archiveLoanAction(formData: FormData) {
  return archiveLoanWithState(
    { status: "idle", message: "" },
    formData,
  );
}

export async function archiveLoanWithState(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview Mode: archive is simulated and not saved.",
    };
  }

  const loanId = String(formData.get("loanId") ?? "");

  if (!loanId) {
    return { status: "error", message: "Loan is missing." };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { error: updateError } = await auth.supabase
    .from("loans")
    .update({ status: "closed" })
    .eq("id", loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active");

  if (updateError) {
    return { status: "error", message: updateError.message };
  }

  const { error: historyError } = await auth.supabase.from("payment_histories").insert({
    user_id: auth.user.id,
    loan_id: loanId,
    type: "loan_closed",
    amount: 0,
    note: "Loan archived",
  });

  if (historyError) {
    return { status: "error", message: historyError.message };
  }

  revalidateLoanViews();
  revalidatePath(`/loans/${loanId}`);
  revalidatePath(`/archive/${loanId}`);

  return { status: "success", message: "Loan archived." };
}

export async function rescheduleLoanAction(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview mode: reschedule simulated.",
    };
  }

  const parsed = parseRescheduleLoan(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { data: loanData, error: loanError } = await auth.supabase
    .from("loans")
    .select("id,current_due_date")
    .eq("id", parsed.input.loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (loanError) {
    return { status: "error", message: loanError.message };
  }

  if (!loanData) {
    return {
      status: "error",
      message: "Only active loans can be rescheduled.",
    };
  }

  const { error } = await auth.supabase
    .from("loans")
    .update({ current_due_date: parsed.input.currentDueDate })
    .eq("id", parsed.input.loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active");

  if (error) {
    return { status: "error", message: error.message };
  }

  const { error: historyError } = await auth.supabase.from("payment_histories").insert({
    user_id: auth.user.id,
    loan_id: parsed.input.loanId,
    type: "rescheduled",
    amount: 0,
    note: `From: ${formatDateForHistory(loanData.current_due_date)}\nTo: ${formatDateForHistory(parsed.input.currentDueDate)}`,
  });

  if (historyError) {
    return { status: "error", message: historyError.message };
  }

  revalidateLoanViews();
  revalidatePath(`/loans/${parsed.input.loanId}`);

  return { status: "success", message: "Due date updated." };
}

export async function closeLoanWithState(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview mode: close loan simulated.",
    };
  }

  const parsed = parseCloseLoan(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { data: loanData, error: loanError } = await auth.supabase
    .from("loans")
    .select(
      "id,user_id,borrower_name,principal,interest_rate,payment_cycle,current_due_date,accumulated_profit,unpaid_interest,credit_balance,status,created_at,updated_at",
    )
    .eq("id", parsed.input.loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (loanError) {
    return { status: "error", message: loanError.message };
  }

  if (!loanData) {
    return { status: "error", message: "Only active loans can be closed." };
  }

  const loan = mapLoanRow(loanData as LoanRow);
  const settlement = calculateCloseLoanSettlement(
    loan,
    parsed.input.amountReceived,
  );

  if (!settlement.isPayoffSatisfied) {
    return {
      status: "error",
      message: "Amount received is less than the payoff amount.",
    };
  }

  const { error: updateError } = await auth.supabase
    .from("loans")
    .update({
      status: "closed",
      accumulated_profit: settlement.accumulatedProfit,
      unpaid_interest: settlement.unpaidInterest,
      credit_balance: settlement.creditBalance,
    })
    .eq("id", parsed.input.loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active");

  if (updateError) {
    return { status: "error", message: updateError.message };
  }

  const { error: historyError } = await auth.supabase.from("payment_histories").insert({
    user_id: auth.user.id,
    loan_id: parsed.input.loanId,
    type: "loan_closed",
    amount: settlement.amountReceived,
    note: formatSettlementHistoryNote(settlement, parsed.input.note),
  });

  if (historyError) {
    return { status: "error", message: historyError.message };
  }

  revalidateLoanViews();
  revalidatePath(`/loans/${parsed.input.loanId}`);
  revalidatePath(`/archive/${parsed.input.loanId}`);

  redirect(`/archive/${parsed.input.loanId}?feedback=loan-moved`);

  return { status: "success", message: "Loan closed." };
}

function formatSettlementHistoryNote(
  settlement: ReturnType<typeof calculateCloseLoanSettlement>,
  note: string,
) {
  const lines = [
    `Total settlement received: ${formatMoney(settlement.amountReceived)}`,
    `Principal returned: ${formatMoney(settlement.principalReturn)}`,
    `Final interest received: ${formatMoney(settlement.finalInterestReceived)}`,
    `Credit applied: ${formatMoney(settlement.creditApplied)}`,
  ];

  if (settlement.overpayment > 0) {
    lines.push(`Extra received: ${formatMoney(settlement.overpayment)}`);
  }

  if (note) {
    lines.push(`Note: ${note}`);
  }

  return lines.join("\n");
}

function formatDateForHistory(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export async function deleteLoanWithState(
  _prevState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  if (isPreviewMode()) {
    return {
      status: "success",
      message: "Preview mode: loan deleted.",
    };
  }

  const loanId = String(formData.get("loanId") ?? "").trim();

  if (!loanId) {
    return { status: "error", message: "Loan is missing." };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { data: loan, error: findError } = await auth.supabase
    .from("loans")
    .select("id")
    .eq("id", loanId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (findError) {
    return { status: "error", message: findError.message };
  }

  if (!loan) {
    return { status: "error", message: "Loan not found." };
  }

  const { error: deleteError } = await auth.supabase
    .from("loans")
    .delete()
    .eq("id", loanId)
    .eq("user_id", auth.user.id);

  if (deleteError) {
    return { status: "error", message: deleteError.message };
  }

  revalidateLoanViews();
  revalidatePath(`/loans/${loanId}`);
  revalidatePath(`/archive/${loanId}`);

  redirect(`${getSafePostDeleteHref(formData)}?feedback=loan-deleted`);

  return { status: "success", message: "Loan deleted." };
}
