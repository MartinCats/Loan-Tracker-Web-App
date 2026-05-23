"use client";

import { useMemo, useState } from "react";
import { LoanList } from "@/components/loans/loan-list";
import {
  getDaysUntilDue,
  getLoanUrgency,
  getUrgencyRank,
  type LoanUrgency,
} from "@/lib/loans/urgency";
import type { Loan } from "@/lib/types/loan";

type LoanFilter = "all" | "overdue" | "due-today" | "upcoming";
type LoanSort = "urgency" | "name" | "principal" | "due-date";

type LoanBrowserState = {
  search: string;
  filter: LoanFilter;
  sort: LoanSort;
};

const filterOptions: Array<{ label: string; value: LoanFilter }> = [
  { label: "All", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Due today", value: "due-today" },
  { label: "Upcoming", value: "upcoming" },
];

const sortOptions: Array<{ label: string; value: LoanSort }> = [
  { label: "Urgency", value: "urgency" },
  { label: "Name", value: "name" },
  { label: "Principal", value: "principal" },
  { label: "Due date", value: "due-date" },
];

export function LoanBrowser({
  loans,
  todayDate,
}: {
  loans: Loan[];
  todayDate: string;
}) {
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
          <span>Search</span>
          <input
            autoComplete="off"
            name="loanSearch"
            onChange={(event) =>
              setState((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Borrower name"
            type="search"
            value={state.search}
          />
        </label>

        <div className="chip-group">
          <span>Sort</span>
          <div className="chip-scroll" role="group" aria-label="Sort loans">
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
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chip-group">
        <span>Filter</span>
        <div className="chip-scroll" role="group" aria-label="Loan filters">
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
              {option.label}
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
              Clear search
            </button>
          ) : null
        }
        emptyDescription={getEmptyDescription(state.filter, state.search)}
        emptyTitle={getEmptyTitle(state.filter, state.search)}
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

function getEmptyTitle(filter: LoanFilter, search: string) {
  if (search) {
    return "No matching loans";
  }

  if (filter === "overdue") {
    return "No overdue loans";
  }

  if (filter === "due-today") {
    return "Nothing due today";
  }

  if (filter === "upcoming") {
    return "No upcoming loans";
  }

  return "No active loans";
}

function getEmptyDescription(filter: LoanFilter, search: string) {
  if (search) {
    return "Try another borrower name or clear the search.";
  }

  const descriptions: Record<LoanUrgency | "all" | "due-today" | "upcoming", string> = {
    all: "Create new loans from the Dashboard when you are ready.",
    overdue: "Good. No active loans are currently past due.",
    "due-today": "No active loans are due today.",
    upcoming: "No active loans have future due dates.",
    healthy: "No active loans are currently past due.",
    "due-soon": "No active loans are due in the next few days.",
  };

  return descriptions[filter];
}
