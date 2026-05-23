import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateDashboardMetrics } from "@/lib/loans/metrics";
import { mapLoanRow, type LoanDashboardResult, type LoanListResult, type LoanRow } from "@/lib/loans/types";
import { isPreviewMode } from "@/lib/preview";
import { previewLoans } from "@/lib/preview-data";
import type { LoanStatus } from "@/lib/types/loan";

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

export async function getLoans(status?: LoanStatus): Promise<LoanListResult> {
  if (isPreviewMode()) {
    return {
      loans: previewLoans
        .filter((loan) => (status ? loan.status === status : true))
        .sort((a, b) => a.currentDueDate.localeCompare(b.currentDueDate)),
    };
  }

  const { supabase } = await getAuthenticatedSupabase();
  let query = supabase
    .from("loans")
    .select(
      "id,user_id,borrower_name,principal,interest_rate,payment_cycle,current_due_date,accumulated_profit,unpaid_interest,credit_balance,status,created_at,updated_at",
    )
    .order("current_due_date", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return {
      loans: [],
      error: error.message,
    };
  }

  return {
    loans: ((data ?? []) as LoanRow[]).map(mapLoanRow),
  };
}

export async function getDashboardData(): Promise<LoanDashboardResult> {
  const result = await getLoans();

  return {
    ...result,
    metrics: calculateDashboardMetrics(result.loans),
  };
}
