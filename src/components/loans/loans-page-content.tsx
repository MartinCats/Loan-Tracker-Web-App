"use client";

import { useState } from "react";
import { LoanBrowser } from "@/components/loans/loan-browser";
import { usePreviewStore } from "@/components/preview/preview-store";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { LenderProfile } from "@/lib/lender-profiles/types";
import type { Loan } from "@/lib/types/loan";

export type LoansViewMode = "normal" | "collection";

type LoansPageContentProps = {
  activeLenderProfile?: LenderProfile | null;
  error?: string;
  initialLoans: Loan[];
  todayDate: string;
};

export function LoansPageContent({
  activeLenderProfile,
  error,
  initialLoans,
  todayDate,
}: LoansPageContentProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<LoansViewMode>("normal");
  const previewStore = usePreviewStore();
  const loans = previewStore
    ? previewStore.loans.filter((loan) => loan.status === "active")
    : initialLoans;

  return (
    <main
      className={cn(
        "page-stack loans-page",
        viewMode === "collection" && "loans-page--collection",
      )}
    >
      <PageHeader
        eyebrow={t("loans.eyebrow")}
        title={t("loans.title")}
        description={
          previewStore
            ? t("dashboard.previewDescription")
            : t("loans.liveDescription")
        }
        action={
          <div
            className="segmented-control loans-view-toggle"
            role="group"
            aria-label={t("loans.viewMode")}
          >
            <button
              className={viewMode === "normal" ? "is-active" : ""}
              onClick={() => setViewMode("normal")}
              type="button"
            >
              {t("loans.normalMode")}
            </button>
            <button
              className={viewMode === "collection" ? "is-active" : ""}
              onClick={() => setViewMode("collection")}
              type="button"
            >
              {t("loans.collectionMode")}
            </button>
          </div>
        }
      />

      <section className="panel">
        {error && !previewStore ? (
          <div className="empty-state empty-state--error">
            <h3>{t("loans.couldNotLoad")}</h3>
            <p>{error}</p>
          </div>
        ) : (
          <LoanBrowser
            activeLenderProfile={activeLenderProfile}
            loans={loans}
            todayDate={todayDate}
            viewMode={viewMode}
          />
        )}
      </section>
    </main>
  );
}
