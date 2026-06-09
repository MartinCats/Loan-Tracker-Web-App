"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCollectorCountdown } from "@/lib/collector-board/calculator";
import type {
  CollectorBoardResult,
  CollectorDateGroup,
  CollectorFilter,
  CollectorLoan,
} from "@/lib/collector-board/types";
import { formatMoney } from "@/lib/format/money";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";

const filters: CollectorFilter[] = ["today", "next_2_days", "month", "all"];

export function CollectorBoardContent({
  result,
  token,
}: {
  result: CollectorBoardResult;
  token: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [router]);

  function refresh() {
    setIsRefreshing(true);
    router.refresh();
    window.setTimeout(() => setIsRefreshing(false), 700);
  }

  if (result.status === "unavailable") {
    return (
      <main className="collector-public-shell collector-public-shell--center">
        <section className="collector-unavailable-card">
          <p className="collector-eyebrow">{t("collectorBoard.unavailableEyebrow")}</p>
          <h1>{t("collectorBoard.unavailableTitle")}</h1>
          <p>{t(`collectorBoard.unavailable.${result.reason}` as MessageKey)}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="collector-public-shell">
      <header className="collector-board-header">
        <div>
          <p className="collector-eyebrow">{t("collectorBoard.eyebrow")}</p>
          <h1>{result.share.name}</h1>
          <p>{t("collectorBoard.description")}</p>
        </div>
        <div className="collector-refresh">
          <span>
            {t("collectorBoard.lastUpdated")}{" "}
            {formatUpdatedAt(result.lastUpdatedAt)}
          </span>
          <button
            aria-busy={isRefreshing}
            className="collector-refresh-button"
            onClick={refresh}
            type="button"
          >
            {isRefreshing
              ? t("collectorBoard.refreshing")
              : t("collectorBoard.refresh")}
          </button>
        </div>
      </header>

      <nav className="collector-filter-strip" aria-label={t("collectorBoard.filters")}>
        {filters.map((filter) => (
          <Link
            className={`collector-filter-chip${
              result.filter === filter ? " is-active" : ""
            }`}
            href={`/collect/${token}${filter === "month" ? "" : `?filter=${filter}`}`}
            key={filter}
            replace
            scroll={false}
          >
            {t(`collectorBoard.filter.${filter}` as MessageKey)}
          </Link>
        ))}
      </nav>

      <section className="collector-board-summary">
        <strong>{result.totalLoans}</strong>
        <span>{t("collectorBoard.visibleLoans")}</span>
      </section>

      {result.groups.length === 0 ? (
        <section className="collector-empty-card">
          <h2>{t("collectorBoard.emptyTitle")}</h2>
          <p>{t("collectorBoard.emptyDescription")}</p>
        </section>
      ) : (
        <section className="collector-date-groups">
          {result.groups.map((group) => (
            <CollectorDateSection
              group={group}
              key={group.dueDate}
              todayDate={result.todayDate}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function CollectorDateSection({
  group,
  todayDate,
}: {
  group: CollectorDateGroup;
  todayDate: string;
}) {
  return (
    <section className="collector-date-section">
      <div className="collector-date-heading">
        <h2>{formatDateLabel(group.dueDate)}</h2>
        <span>{group.loans.length}</span>
      </div>
      <div className="collector-card-list">
        {group.loans.map((loan) => (
          <CollectorLoanCard
            key={loan.id}
            loan={loan}
            todayDate={todayDate}
          />
        ))}
      </div>
    </section>
  );
}

function CollectorLoanCard({
  loan,
  todayDate,
}: {
  loan: CollectorLoan;
  todayDate: string;
}) {
  const countdown = getCollectorCountdown(
    loan.currentDueDate,
    todayDate,
    loan.isCollected,
  );
  const dueLabel = loan.isCollected ? "เก็บแล้ว" : "ต้องเก็บ";

  return (
    <article
      className={`collector-loan-public-card${
        loan.isCollected ? " is-collected" : ""
      }`}
      data-countdown-tone={countdown.tone}
    >
      <div className="collector-loan-public-card__top">
        <h3>{loan.borrowerName}</h3>
        <span className="collector-countdown-badge">{countdown.th}</span>
      </div>

      <p className="collector-owner-chip">
        <span>เจ้าของเงิน:</span>
        <strong>
          {loan.lenderProfile.avatarEmoji} {loan.lenderProfile.name}
        </strong>
      </p>

      <dl className="collector-loan-public-card__metrics">
        <div className="collector-metric--due">
          <dt>{dueLabel}</dt>
          <dd>{formatMoney(loan.amountDue)}</dd>
        </div>
        <div className="collector-metric-row">
          <dt>เงินต้น</dt>
          <dd>{formatMoney(loan.principal)}</dd>
          <span aria-hidden="true">|</span>
          <dt>ดอก</dt>
          <dd>{formatRate(loan.interestRate)}</dd>
        </div>
        <div className="collector-metric-row collector-metric-row--date">
          <dt>กำหนด</dt>
          <dd>{formatCompactDate(loan.currentDueDate)}</dd>
        </div>
      </dl>
    </article>
  );
}

function formatRate(rate: number) {
  return `${Number.isInteger(rate) ? rate : rate.toFixed(2)}%`;
}

function formatUpdatedAt(value: string) {
  const formatter = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatter.format(new Date(value));
}

function formatDateLabel(dateKey: string) {
  const date = dateFromKey(dateKey);

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function formatCompactDate(dateKey: string) {
  const date = dateFromKey(dateKey);
  const dayMonth = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
  const [year] = dateKey.split("-").map(Number);

  return `${dayMonth} ${String((year + 543) % 100).padStart(2, "0")}`;
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}
