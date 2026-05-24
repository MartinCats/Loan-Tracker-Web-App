"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { CreateLoanInput, LoanInsert } from "@/lib/loans/types";
import { paymentCycleOptions } from "@/lib/loans/payment-cycle";
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

  const { data, error } = await auth.supabase
    .from("loans")
    .update({ current_due_date: parsed.input.currentDueDate })
    .eq("id", parsed.input.loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: error.message };
  }

  if (!data) {
    return {
      status: "error",
      message: "Only active loans can be rescheduled.",
    };
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

  const loanId = String(formData.get("loanId") ?? "").trim();

  if (!loanId) {
    return { status: "error", message: "Loan is missing." };
  }

  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return { status: "error", message: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("loans")
    .update({ status: "closed" })
    .eq("id", loanId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: error.message };
  }

  if (!data) {
    return { status: "error", message: "Only active loans can be closed." };
  }

  revalidateLoanViews();
  revalidatePath(`/loans/${loanId}`);
  revalidatePath(`/archive/${loanId}`);

  return { status: "success", message: "Loan closed." };
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

  const { error: historyError } = await auth.supabase
    .from("payment_histories")
    .delete()
    .eq("loan_id", loanId)
    .eq("user_id", auth.user.id);

  if (historyError) {
    return { status: "error", message: historyError.message };
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

  return { status: "success", message: "Loan deleted." };
}
