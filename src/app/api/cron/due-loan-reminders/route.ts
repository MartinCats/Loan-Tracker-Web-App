import { NextResponse } from "next/server";
import {
  formatDueLoanReminderMessages,
  groupDueLoanReminders,
  type DueLoanReminder,
} from "@/lib/notifications/due-loans";
import {
  isDiscordWebhookConfigured,
  sendDiscordWebhook,
} from "@/lib/notifications/discord";
import { calculateTotalDue } from "@/lib/payments/calculator";
import { mapLoanRow, type LoanRow } from "@/lib/loans/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DueLoanRow = LoanRow & {
  lender_profiles:
    | {
        id: string;
        name: string;
        avatar_emoji: string | null;
      }
    | {
        id: string;
        name: string;
        avatar_emoji: string | null;
      }[];
};

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    console.warn("Skipped due loan reminder cron: unauthorized request.");
    return NextResponse.json(
      {
        error: "Unauthorized",
        ok: false,
      },
      { status: 401 },
    );
  }

  if (!isDiscordWebhookConfigured()) {
    console.info("Skipped due loan reminder cron: DISCORD_WEBHOOK_URL is missing.");
    return NextResponse.json({
      ok: true,
      reason: "missing_discord_webhook_url",
      skipped: true,
    });
  }

  const supabase = createAdminClient();

  if (!supabase) {
    console.info(
      "Skipped due loan reminder cron: Supabase admin environment is missing.",
    );
    return NextResponse.json({
      ok: true,
      reason: "missing_supabase_admin_env",
      skipped: true,
    });
  }

  const today = getBangkokDateKey();
  const { data, error } = await supabase
    .from("loans")
    .select(
      "id,user_id,lender_profile_id,borrower_name,principal,interest_rate,payment_cycle,current_due_date,accumulated_profit,unpaid_interest,credit_balance,status,created_at,updated_at,lender_profiles!inner(id,name,avatar_emoji)",
    )
    .eq("status", "active")
    .eq("current_due_date", today)
    .order("lender_profile_id", { ascending: true })
    .order("borrower_name", { ascending: true });

  if (error) {
    console.error("Failed to query due loans for reminders.", error);
    return NextResponse.json(
      {
        error: error.message,
        ok: false,
      },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as DueLoanRow[];

  if (rows.length === 0) {
    console.info(`Skipped due loan reminder cron: no due loans for ${today}.`);
    return NextResponse.json({
      dueLoans: 0,
      ok: true,
      sent: 0,
      skipped: true,
    });
  }

  const reminders = rows.map(mapDueLoanReminder);
  const groups = groupDueLoanReminders(reminders);
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const group of groups) {
    const messages = formatDueLoanReminderMessages(group);

    for (const message of messages) {
      const result = await sendDiscordWebhook(message);

      if (result.ok && result.status === "sent") {
        sent += 1;
        console.info(
          `Sent due loan reminder for lender profile ${group.lenderProfile.id}.`,
        );
        continue;
      }

      if (!result.ok) {
        failed += 1;
        errors.push(result.error);
        console.error(
          `Failed due loan reminder for lender profile ${group.lenderProfile.id}.`,
          result.error,
        );
      }
    }
  }

  if (failed > 0) {
    return NextResponse.json(
      {
        dueLoans: rows.length,
        errors,
        failed,
        ok: false,
        sent,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    dueLoans: rows.length,
    ok: true,
    sent,
  });
}

function isAuthorizedCronRequest(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const secretHeader = request.headers.get("x-cron-secret");
  const userAgent = request.headers.get("user-agent") ?? "";

  const hasValidSecret = Boolean(
    configuredSecret &&
      (authorization === `Bearer ${configuredSecret}` ||
        secretHeader === configuredSecret),
  );
  const hasVercelCronUserAgent = userAgent.includes("vercel-cron");

  return hasValidSecret || hasVercelCronUserAgent;
}

function getBangkokDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Bangkok",
    year: "numeric",
  }).formatToParts(date);
  const partValues = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${partValues.year}-${partValues.month}-${partValues.day}`;
}

function mapDueLoanReminder(row: DueLoanRow): DueLoanReminder {
  const loan = mapLoanRow(row);
  const lenderProfile = Array.isArray(row.lender_profiles)
    ? row.lender_profiles[0]
    : row.lender_profiles;

  return {
    amountDue: calculateTotalDue(loan),
    borrowerName: loan.borrowerName,
    dueDate: loan.currentDueDate,
    lenderProfile: {
      avatarEmoji: lenderProfile.avatar_emoji ?? "👦🏻",
      id: lenderProfile.id,
      name: lenderProfile.name,
    },
  };
}
