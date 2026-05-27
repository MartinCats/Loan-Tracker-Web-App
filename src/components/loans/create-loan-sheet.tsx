"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useMemo, useState } from "react";
import { createLoanAction, type LoanActionState } from "@/lib/loans/actions";
import { getSuggestedFirstDueDate } from "@/lib/loans/due-date";
import { paymentCycleOptions } from "@/lib/loans/payment-cycle";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { PaymentCycle } from "@/lib/types/loan";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

export function CreateLoanSheet() {
  const { t } = useI18n();
  const router = useRouter();
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>("monthly");
  const suggestedDueDate = useMemo(
    () => getSuggestedFirstDueDate(paymentCycle),
    [paymentCycle],
  );
  const [dueDate, setDueDate] = useState(() =>
    getSuggestedFirstDueDate("monthly"),
  );
  const [hasEditedDueDate, setHasEditedDueDate] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [state, formAction] = useActionState(createLoanAction, initialState);

  useEffect(() => {
    if (!hasEditedDueDate) {
      setDueDate(suggestedDueDate);
    }
  }, [hasEditedDueDate, suggestedDueDate]);

  useEffect(() => {
    if (state.status === "success") {
      blurActiveFormControl();
      setIsOpen(false);
      showFeedback(t("feedback.loanAdded"));
      router.refresh();
      scrollToNewestLoan();
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [router, showFeedback, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    blurActiveFormControl(event.currentTarget);

    if (!previewStore) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const borrowerName = String(formData.get("borrowerName") ?? "").trim();
    const principal = Number(formData.get("principal"));
    const interestRate = Number(formData.get("interestRate"));
    const currentDueDate = String(formData.get("currentDueDate") ?? "");

    if (!borrowerName || !Number.isFinite(principal) || principal <= 0) {
      setPreviewMessage("Preview mode: enter a borrower and valid principal.");
      return;
    }

    if (!Number.isFinite(interestRate) || interestRate < 0 || !currentDueDate) {
      setPreviewMessage("Preview mode: check interest rate and due date.");
      return;
    }

    setIsPreviewPending(true);
    const loan = previewStore.addLoan({
      borrowerName,
      principal,
      interestRate,
      paymentCycle,
      currentDueDate,
    });
    window.setTimeout(() => {
      blurActiveFormControl();
      setPreviewMessage("Preview mode: loan added. Data resets on refresh.");
      showFeedback(t("feedback.loanAdded"));
      setIsOpen(false);
      setPaymentCycle("monthly");
      setHasEditedDueDate(false);
      setIsPreviewPending(false);
      scrollToLoan(loan.id);
    }, 120);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        <button className="plain-button plain-button--primary" onClick={() => setIsOpen(true)} type="button">
          <span aria-hidden="true">+</span>
          {t("create.addLoan")}
        </button>
        {!isOpen && previewMessage ? (
          <p className="inline-status is-success" role="status">
            {previewMessage}
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <div className="sheet-backdrop" role="presentation">
          <section
            aria-label={t("create.newLoan")}
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>{t("create.newLoan")}</h2>
                <p>{t("create.description")}</p>
              </div>
              <button
                aria-label={t("create.close")}
                className="icon-button"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                x
              </button>
            </div>

            <form
              action={previewStore ? undefined : formAction}
              className="auth-form auth-form--compact"
              onSubmit={handleSubmit}
            >
              <label className="field">
                <span>{t("create.borrower")}</span>
                <input
                  autoComplete="name"
                  name="borrowerName"
                  placeholder={t("loans.borrowerName")}
                  required
                  type="text"
                />
              </label>

              <div className="form-grid-two">
                <label className="field">
                  <span>{t("create.principal")}</span>
                  <input
                    inputMode="decimal"
                    min="0.01"
                    name="principal"
                    placeholder="10000"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>

                <label className="field">
                  <span>{t("create.interest")}</span>
                  <input
                    inputMode="decimal"
                    min="0"
                    name="interestRate"
                    placeholder="8"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>
              </div>

              <div className="field">
                <span>{t("create.paymentCycle")}</span>
                <input name="paymentCycle" type="hidden" value={paymentCycle} />
                <div className="cycle-chip-grid" role="group" aria-label={t("create.paymentCycle")}>
                  {paymentCycleOptions.map((option) => (
                    <button
                      aria-pressed={paymentCycle === option.value}
                      className={`chip-button${paymentCycle === option.value ? " is-active" : ""}`}
                      key={option.value}
                      onClick={() => setPaymentCycle(option.value)}
                      type="button"
                    >
                      {t(`cycle.${option.value}` as MessageKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span>{t("create.currentDueDate")}</span>
                <div className="date-field">
                  <span className="date-field__display">
                    {dueDate ? formatDate(dueDate) : t("create.chooseDate")}
                  </span>
                  <span className="date-field__hint">{t("common.change")}</span>
                  <input
                    aria-label={t("create.currentDueDate")}
                    className="date-field__native"
                    name="currentDueDate"
                    onChange={(event) => {
                      setDueDate(event.target.value);
                      setHasEditedDueDate(true);
                    }}
                    required
                    type="date"
                    value={dueDate}
                  />
                </div>
                <small>{t("create.suggestedHint")}</small>
              </div>

              {hasEditedDueDate && dueDate !== suggestedDueDate ? (
                <button
                  className="text-button text-button--muted"
                  onClick={() => {
                    setDueDate(suggestedDueDate);
                    setHasEditedDueDate(false);
                  }}
                  type="button"
                >
                  {t("create.useSuggestedDate")}
                </button>
              ) : null}

              <div className="sheet-actions">
                <AuthSubmitButton
                  forcePending={isPreviewPending}
                  pendingLabel={t("create.creating")}
                >
                  {t("create.createLoan")}
                </AuthSubmitButton>
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  {t("common.cancel")}
                </button>
              </div>

              {state.status === "error" && state.message ? (
                <p className="auth-message" role="alert">
                  {state.message}
                </p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function blurActiveFormControl(scope?: HTMLElement) {
  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) {
    return;
  }

  if (scope && !scope.contains(activeElement)) {
    return;
  }

  activeElement.blur();
}

function scrollToLoan(loanId: string) {
  window.setTimeout(() => {
    document
      .querySelector<HTMLElement>(`[data-loan-id="${loanId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 180);
}

function scrollToNewestLoan() {
  window.setTimeout(() => {
    document
      .querySelector<HTMLElement>("[data-loan-id]")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 220);
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
