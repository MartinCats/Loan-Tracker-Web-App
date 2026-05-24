"use client";

import { useMemo, useState } from "react";
import { LoanList } from "@/components/loans/loan-list";
import {
  getDaysUntilDue,
  getLoanUrgency,
  getUrgencyRank,
  type LoanUrgency,
} from "@/lib/loans/urgency";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { Loan } from "@/lib/types/loan";

type LoanFilter = "all" | "overdue" | "due-today" | "upcoming";
type LoanSort = "urgency" | "name" | "principal" | "due-date";

type LoanBrowserState = {
  search: string;
  filter: LoanFilter;
  sort: LoanSort;
};

const filterOptions: Array<{ labelKey: MessageKey; value: LoanFilter }> = [
  { labelKey: "loans.all", value: "all" },
  { labelKey: "loans.overdue", value: "overdue" },
  { labelKey: "loans.dueToday", value: "due-today" },
  { labelKey: "loans.upcoming", value: "upcoming" },
];

const sortOptions: Array<{ labelKey: MessageKey; value: LoanSort }> = [
  { labelKey: "loans.urgency", value: "urgency" },
  { labelKey: "loans.name", value: "name" },
  { labelKey: "loans.principal", value: "principal" },
  { labelKey: "loans.dueDate", value: "due-date" },
];

export function LoanBrowser({
  loans,
  todayDate,
}: {
  loans: Loan[];
  todayDate: string;
}) {
  const { t } = useI18n();
  const [state, setState] = useState<LoanBrowserState>({
    search: "",
    filter: "all",
    sort: "urgency",
  });

  const visibleLoans = useMemo(() => {
    const search = state.search.trim().toLowerCase();

    return loans
      .filter((loan) => {
        if (search && !loan.borrowerName.toLowerCase().includes(search)) {
          return false;
        }

        if (state.filter === "overdue") {
          return getLoanUrgency(loan, todayDate) === "overdue";
        }

        if (state.filter === "due-today") {
          return getDaysUntilDue(loan.currentDueDate, todayDate) === 0;
        }

        if (state.filter === "upcoming") {
          return getDaysUntilDue(loan.currentDueDate, todayDate) > 0;
        }

        return loan.status === "active";
      })
      .sort((a, b) => sortLoans(a, b, state.sort, todayDate));
  }, [loans, state, todayDate]);

  return (
    <div className="loan-browser plain-loan-browser">
      <div className="compact-browser-controls">
        <label className="plain-field">
          <span>{t("common.search")}</span>
          <input
            autoComplete="off"
            name="loanSearch"
            onChange={(event) =>
              setState((current) => ({ ...current, search: event.target.value }))
            }
            placeholder={t("loans.borrowerName")}
            type="search"
            value={state.search}
          />
        </label>

        <div className="chip-group">
          <span>{t("common.sort")}</span>
          <div className="chip-scroll" role="group" aria-label={t("common.sort")}>
            {sortOptions.map((option) => (
              <button
                aria-pressed={state.sort === option.value}
                className={`chip-button${state.sort === option.value ? " is-active" : ""}`}
                key={option.value}
                onClick={() =>
                  setState((current) => ({ ...current, sort: option.value }))
                }
                type="button"
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chip-group">
        <span>{t("common.filter")}</span>
        <div className="chip-scroll" role="group" aria-label={t("common.filter")}>
          {filterOptions.map((option) => (
            <button
              aria-pressed={state.filter === option.value}
              className={`chip-button${state.filter === option.value ? " is-active" : ""}`}
              key={option.value}
              onClick={() =>
                setState((current) => ({ ...current, filter: option.value }))
              }
              type="button"
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <LoanList
        emptyAction={
          state.filter === "all" && !state.search ? (
            null
          ) : state.search ? (
            <button
              className="plain-button"
              onClick={() => setState((current) => ({ ...current, search: "" }))}
              type="button"
            >
              {t("loans.clearSearch")}
            </button>
          ) : null
        }
        emptyDescription={getEmptyDescription(state.filter, state.search, t)}
        emptyTitle={getEmptyTitle(state.filter, state.search, t)}
        loans={visibleLoans}
        mode="active"
        todayDate={todayDate}
      />
    </div>
  );
}

function sortLoans(a: Loan, b: Loan, sort: LoanSort, todayDate: string) {
  switch (sort) {
    case "principal":
      return b.principal - a.principal;
    case "name":
      return a.borrowerName.localeCompare(b.borrowerName);
    case "due-date":
      return (
        getDaysUntilDue(a.currentDueDate, todayDate) -
        getDaysUntilDue(b.currentDueDate, todayDate)
      );
    case "urgency":
    default:
      return (
        getUrgencyRank(a, todayDate) - getUrgencyRank(b, todayDate) ||
        getDaysUntilDue(a.currentDueDate, todayDate) -
          getDaysUntilDue(b.currentDueDate, todayDate)
      );
  }
}

function getEmptyTitle(
  filter: LoanFilter,
  search: string,
  t: (key: MessageKey) => string,
) {
  if (search) {
    return t("loans.noMatching");
  }

  if (filter === "overdue") {
    return t("loans.noOverdue");
  }

  if (filter === "due-today") {
    return t("loans.nothingDueToday");
  }

  if (filter === "upcoming") {
    return t("loans.noUpcoming");
  }

  return t("loans.noActive");
}

function getEmptyDescription(
  filter: LoanFilter,
  search: string,
  t: (key: MessageKey) => string,
) {
  if (search) {
    return t("loans.tryAnother");
  }

  const descriptions: Record<LoanUrgency | "all" | "due-today" | "upcoming", string> = {
    all: t("loans.createFromDashboard"),
    overdue: t("loans.noPastDue"),
    "due-today": t("loans.noneDueToday"),
    upcoming: t("loans.noFutureDue"),
    healthy: t("loans.noPastDue"),
    "due-soon": t("loans.noFutureDue"),
  };

  return descriptions[filter];
}
