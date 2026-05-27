import type { Loan } from "@/lib/types/loan";

export type LoanUrgency = "healthy" | "due-soon" | "due-today" | "overdue";

const dueSoonDays = 3;

export function getTodayDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateKeyToUtcTime(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function getDaysUntilDue(dueDate: string, todayDate = getTodayDateKey()) {
  return Math.round((dateKeyToUtcTime(dueDate) - dateKeyToUtcTime(todayDate)) / 86_400_000);
}

export function getLoanUrgency(
  loan: Pick<Loan, "currentDueDate" | "status">,
  todayDate = getTodayDateKey(),
): LoanUrgency {
  if (loan.status === "closed") {
    return "healthy";
  }

  const daysLeft = getDaysUntilDue(loan.currentDueDate, todayDate);

  if (daysLeft < 0) {
    return "overdue";
  }

  if (daysLeft === 0) {
    return "due-today";
  }

  if (daysLeft <= dueSoonDays) {
    return "due-soon";
  }

  return "healthy";
}

export function formatDueLabel(dueDate: string, todayDate = getTodayDateKey()) {
  const daysLeft = getDaysUntilDue(dueDate, todayDate);

  if (daysLeft < 0) {
    const daysOverdue = Math.abs(daysLeft);
    return daysOverdue === 1 ? "Overdue by 1 day" : `Overdue by ${daysOverdue} days`;
  }

  if (daysLeft === 0) {
    return "Due today";
  }

  if (daysLeft === 1) {
    return "Tomorrow";
  }

  return `${daysLeft} days left`;
}

export function getUrgencyLabel(urgency: LoanUrgency) {
  switch (urgency) {
    case "overdue":
      return "Overdue";
    case "due-soon":
      return "Due soon";
    case "due-today":
      return "Due today";
    default:
      return "Healthy";
  }
}

export function getUrgencyRank(loan: Loan, todayDate = getTodayDateKey()) {
  const urgency = getLoanUrgency(loan, todayDate);

  if (urgency === "overdue") {
    return 0;
  }

  if (urgency === "due-today") {
    return 1;
  }

  if (urgency === "due-soon") {
    return 2;
  }

  return 3;
}
