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

type LoanFilter = "active" | "overdue" | "due-soon";
type LoanSort = "urgency" | "due-date" | "principal" | "borrower";

type LoanBrowserState = {
  search: string;
  filter: LoanFilter;
  sort: LoanSort;
};

const filterOptions: Array<{ label: string; value: LoanFilter }> = [
  { label: "Active", value: "active" },
  { label: "Overdue", value: "overdue" },
  { label: "Due soon", value: "due-soon" },
];

const sortOptions: Array<{ label: string; value: LoanSort }> = [
  { label: "Urgency", value: "urgency" },
  { label: "Due date", value: "due-date" },
  { label: "Principal", value: "principal" },
  { label: "Borrower", value: "borrower" },
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
    filter: "active",
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

        if (state.filter === "due-soon") {
          return getLoanUrgency(loan, todayDate) === "due-soon";
        }

        return loan.status === "active";
      })
      .sort((a, b) => sortLoans(a, b, state.sort, todayDate));
  }, [loans, state, todayDate]);

  return (
    <div className="loan-browser plain-loan-browser">
      <div className="plain-controls">
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

        <div className="plain-field">
          <span>Sort</span>
          <div className="plain-button-row" role="group" aria-label="Sort loans">
            {sortOptions.map((option) => (
              <button
                aria-pressed={state.sort === option.value}
                className={`plain-button${state.sort === option.value ? " is-active" : ""}`}
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

      <div className="plain-button-row" role="group" aria-label="Loan filters">
        {filterOptions.map((option) => (
          <button
            aria-pressed={state.filter === option.value}
            className={`plain-button${state.filter === option.value ? " is-active" : ""}`}
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

      <LoanList
        emptyAction={
          state.filter === "active" && !state.search ? (
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
    case "borrower":
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

  if (filter === "due-soon") {
    return "Nothing due soon";
  }

  return "No active loans";
}

function getEmptyDescription(filter: LoanFilter, search: string) {
  if (search) {
    return "Try another borrower name or clear the search.";
  }

  const descriptions: Record<LoanUrgency | "active", string> = {
    active: "Add a loan to begin tracking principal, due date, and profit.",
    overdue: "Good. No active loans are currently past due.",
    "due-soon": "No active loans are due in the next few days.",
    healthy: "No active loans are currently past due.",
  };

  return descriptions[filter];
}
