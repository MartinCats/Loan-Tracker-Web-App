import {
  addDaysToDateKey,
  getTodayDateKeyUtc,
} from "@/lib/loans/due-date";
import { getDaysUntilDue } from "@/lib/loans/urgency";
import type {
  CollectionShare,
  CollectorCountdown,
  CollectorDateGroup,
  CollectorFilter,
  CollectorLoan,
} from "@/lib/collector-board/types";

const millisecondsPerDay = 86_400_000;

export function normalizeCollectorFilter(
  value: string | string[] | undefined,
): CollectorFilter {
  const filter = Array.isArray(value) ? value[0] : value;

  if (
    filter === "today" ||
    filter === "next_2_days" ||
    filter === "month" ||
    filter === "all"
  ) {
    return filter;
  }

  return "month";
}

export function filterCollectorLoansByRange(
  loans: CollectorLoan[],
  filter: CollectorFilter,
  todayDate = getTodayDateKeyUtc(),
) {
  const { startDate, endDate } = getCollectorFilterDateRange(filter, todayDate);

  return loans.filter((loan) => {
    if (startDate && loan.currentDueDate < startDate) {
      return false;
    }

    if (endDate && loan.currentDueDate > endDate) {
      return false;
    }

    return true;
  });
}

export function filterCollectorLoansByProfileIds(
  loans: CollectorLoan[],
  profileIds: string[],
) {
  const visibleProfileIds = new Set(profileIds);

  return loans.filter((loan) => visibleProfileIds.has(loan.lenderProfile.id));
}

export function filterActiveCollectorLoans(loans: CollectorLoan[]) {
  return loans.filter((loan) => loan.status === "active");
}

export function groupCollectorLoansByDueDate(
  loans: CollectorLoan[],
): CollectorDateGroup[] {
  const sortedLoans = [...loans].sort((a, b) => {
    const dateOrder = a.currentDueDate.localeCompare(b.currentDueDate);

    if (dateOrder !== 0) {
      return dateOrder;
    }

    if (a.isCollected !== b.isCollected) {
      return a.isCollected ? 1 : -1;
    }

    return a.borrowerName.localeCompare(b.borrowerName);
  });
  const groups = new Map<string, CollectorLoan[]>();

  for (const loan of sortedLoans) {
    groups.set(loan.currentDueDate, [
      ...(groups.get(loan.currentDueDate) ?? []),
      loan,
    ]);
  }

  return Array.from(groups.entries()).map(([dueDate, groupLoans]) => ({
    dueDate,
    loans: groupLoans,
  }));
}

export function getCollectorCountdown(
  dueDate: string,
  todayDate = getTodayDateKeyUtc(),
  isCollected = false,
): CollectorCountdown {
  const daysUntilDue = getDaysUntilDue(dueDate, todayDate);

  if (isCollected) {
    return {
      daysUntilDue,
      en: "COLLECTED",
      th: "เก็บแล้ว",
      tone: "collected",
    };
  }

  if (daysUntilDue < 0) {
    return {
      daysUntilDue,
      en: "OVERDUE",
      th: "เกินกำหนด",
      tone: "overdue",
    };
  }

  if (daysUntilDue === 0) {
    return {
      daysUntilDue,
      en: "TODAY",
      th: "วันนี้",
      tone: "today",
    };
  }

  if (daysUntilDue === 1) {
    return {
      daysUntilDue,
      en: "1 DAY",
      th: "1 วัน",
      tone: "soon",
    };
  }

  return {
    daysUntilDue,
    en: `${daysUntilDue} DAYS`,
    th: `${daysUntilDue} วัน`,
    tone: daysUntilDue <= 2 ? "soon" : "future",
  };
}

export function getCollectorFilterDateRange(
  filter: CollectorFilter,
  todayDate = getTodayDateKeyUtc(),
) {
  switch (filter) {
    case "today":
      return {
        startDate: todayDate,
        endDate: todayDate,
      };
    case "next_2_days":
      return {
        startDate: todayDate,
        endDate: addDaysToDateKey(todayDate, 2),
      };
    case "all":
      return {
        startDate: null,
        endDate: null,
      };
    case "month":
    default:
      return getCurrentMonthDateRange(todayDate);
  }
}

export function getCurrentMonthDateRange(todayDate = getTodayDateKeyUtc()) {
  const [year, month] = todayDate.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonthStart = Date.UTC(nextMonthYear, nextMonth - 1, 1);
  const endDate = new Date(nextMonthStart - millisecondsPerDay);

  return {
    startDate,
    endDate: `${endDate.getUTCFullYear()}-${String(
      endDate.getUTCMonth() + 1,
    ).padStart(2, "0")}-${String(endDate.getUTCDate()).padStart(2, "0")}`,
  };
}

export function getCollectorShareUnavailableReason(
  share: Pick<CollectionShare, "isActive"> | null | undefined,
  isConfigured = true,
) {
  if (!isConfigured) {
    return "not_configured";
  }

  if (!share) {
    return "invalid";
  }

  if (!share.isActive) {
    return "inactive";
  }

  return null;
}
