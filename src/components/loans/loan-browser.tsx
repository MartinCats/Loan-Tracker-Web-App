"use client";

import { useEffect, useMemo, useState } from "react";
import { LoanList } from "@/components/loans/loan-list";
import type { LoansViewMode } from "@/components/loans/loans-page-content";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import {
  getDaysUntilDue,
  getLoanUrgency,
  getUrgencyRank,
  type LoanUrgency,
} from "@/lib/loans/urgency";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { LenderProfile } from "@/lib/lender-profiles/types";
import { calculateTotalDue } from "@/lib/payments/calculator";
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
  activeLenderProfile,
  loans,
  todayDate,
  viewMode = "normal",
}: {
  activeLenderProfile?: LenderProfile | null;
  loans: Loan[];
  todayDate: string;
  viewMode?: LoansViewMode;
}) {
  const { language, t } = useI18n();
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [state, setState] = useState<LoanBrowserState>({
    search: "",
    filter: "all",
    sort: "urgency",
  });

  useEffect(() => {
    setGeneratedAt(new Date());
  }, [viewMode]);

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

  const selectedFilterLabel = t(
    filterOptions.find((option) => option.value === state.filter)?.labelKey ??
      "loans.all",
  );

  return (
    <div
      className={cn(
        "loan-browser plain-loan-browser",
        viewMode === "collection" && "loan-browser--collection",
      )}
    >
      {viewMode === "collection" ? (
        <CollectionScreenshotHeader
          activeLenderProfile={activeLenderProfile}
          generatedAt={generatedAt}
          language={language}
          selectedFilterLabel={selectedFilterLabel}
          totalItems={visibleLoans.length}
          t={t}
        />
      ) : null}

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

      {viewMode === "collection" ? (
        visibleLoans.length === 0 ? (
          <div className="empty-state collection-empty-state">
            <h3>{getEmptyTitle(state.filter, state.search, t)}</h3>
            <p>{getEmptyDescription(state.filter, state.search, t)}</p>
          </div>
        ) : (
          <div className="collection-loan-list">
            {visibleLoans.map((loan) => (
              <CollectionLoanCard
                activeLenderProfile={activeLenderProfile}
                key={loan.id}
                language={language}
                loan={loan}
                t={t}
              />
            ))}
          </div>
        )
      ) : (
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
      )}
    </div>
  );
}

function CollectionScreenshotHeader({
  activeLenderProfile,
  generatedAt,
  language,
  selectedFilterLabel,
  totalItems,
  t,
}: {
  activeLenderProfile?: LenderProfile | null;
  generatedAt: Date | null;
  language: "en" | "th";
  selectedFilterLabel: string;
  totalItems: number;
  t: (key: MessageKey) => string;
}) {
  const profileLabel = activeLenderProfile
    ? `${activeLenderProfile.avatarEmoji} ${activeLenderProfile.name}`
    : t("profiles.mainFallback");

  return (
    <section className="collection-header" aria-label={t("loans.collectionHeader")}>
      <div className="collection-header__identity">
        <strong>{profileLabel}</strong>
        <span>{t("loans.collectionMode")}</span>
      </div>
      <div className="collection-header__meta">
        <span>
          {t("loans.selectedFilter")}: {selectedFilterLabel}
        </span>
        <span>
          {t("loans.generatedAt")}:{" "}
          {generatedAt ? formatGeneratedAt(generatedAt, language) : "-"}
        </span>
        <span>
          {t("loans.totalVisible")}: {totalItems}
        </span>
      </div>
    </section>
  );
}

function CollectionLoanCard({
  activeLenderProfile,
  language,
  loan,
  t,
}: {
  activeLenderProfile?: LenderProfile | null;
  language: "en" | "th";
  loan: Loan;
  t: (key: MessageKey) => string;
}) {
  const dueAmount = calculateTotalDue(loan);
  const profileName = activeLenderProfile?.name ?? t("profiles.mainFallback");

  return (
    <article className="collection-loan-card">
      <div className="collection-loan-card__title">
        <span className="collection-checkmark" aria-hidden="true">
          🎯
        </span>
        <strong>{loan.borrowerName}</strong>
        <span className="collection-profile-chip">
          {activeLenderProfile ? (
            <span aria-hidden="true">{activeLenderProfile.avatarEmoji}</span>
          ) : null}
          <span>{profileName}</span>
        </span>
      </div>
      <div className="collection-loan-card__metrics">
        <span>{t("loans.collectionPrincipal")}</span>
        <span>{t("loans.collectionInterestRate")}</span>
        <span>{t("loans.collectionDue")}</span>
        <span>{t("loans.collectionDate")}</span>
        <strong className="collection-metric-value collection-metric-value--principal">
          {formatMoney(loan.principal)}
        </strong>
        <strong className="collection-metric-value collection-metric-value--rate">
          {loan.interestRate}%
        </strong>
        <strong className="collection-metric-value collection-metric-value--due">
          {formatMoney(dueAmount)}
        </strong>
        <strong className="collection-metric-value collection-metric-value--date">
          {formatCollectionDate(loan.currentDueDate, language)}
        </strong>
      </div>
    </article>
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

function formatCollectionDate(dateKey: string, language: "en" | "th") {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: language === "th" ? "2-digit" : undefined,
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatGeneratedAt(date: Date, language: "en" | "th") {
  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
