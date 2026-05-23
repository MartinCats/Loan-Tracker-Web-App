import type { PaymentCycle } from "@/lib/types/loan";

export function formatDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayDateKeyUtc(now = new Date()) {
  return formatDateKey(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  );
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = parseDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return formatDateKey(date);
}

export function addMonthsToDateKey(dateKey: string, monthsToAdd: number) {
  const [year, month, day] = parseDateKey(dateKey);
  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetDate = new Date(Date.UTC(year, targetMonthIndex, 1));
  const targetYear = targetDate.getUTCFullYear();
  const targetMonth = targetDate.getUTCMonth();
  const daysInTargetMonth = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const safeDay = Math.min(day, daysInTargetMonth);

  return formatDateKey(new Date(Date.UTC(targetYear, targetMonth, safeDay)));
}

export function getSuggestedFirstDueDate(
  paymentCycle: PaymentCycle,
  todayDate = getTodayDateKeyUtc(),
) {
  switch (paymentCycle) {
    case "daily":
      return addDaysToDateKey(todayDate, 1);
    case "weekly":
      return addDaysToDateKey(todayDate, 7);
    case "biweekly":
      return addDaysToDateKey(todayDate, 14);
    case "every_10_days":
      return addDaysToDateKey(todayDate, 10);
    case "monthly":
    default:
      return addMonthsToDateKey(todayDate, 1);
  }
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  return [year, month, day] as const;
}
