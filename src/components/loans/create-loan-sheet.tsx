"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useMemo, useState } from "react";
import { createLoanAction, type LoanActionState } from "@/lib/loans/actions";
import { getSuggestedFirstDueDate } from "@/lib/loans/due-date";
import { paymentCycleOptions } from "@/lib/loans/payment-cycle";
import type { PaymentCycle } from "@/lib/types/loan";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

export function CreateLoanSheet() {
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
      setIsOpen(false);
      showFeedback("Loan added");
      router.refresh();
      scrollToNewestLoan();
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [router, showFeedback, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      setPreviewMessage("Preview mode: loan added. Data resets on refresh.");
      showFeedback("Loan added");
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
          Add loan
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
            aria-label="Create loan"
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>New loan</h2>
                <p>Core terms only. Payments come later.</p>
              </div>
              <button
                aria-label="Close create loan sheet"
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
                <span>Borrower</span>
                <input
                  autoComplete="name"
                  name="borrowerName"
                  placeholder="Borrower name"
                  required
                  type="text"
                />
              </label>

              <div className="form-grid-two">
                <label className="field">
                  <span>Principal</span>
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
                  <span>Interest %</span>
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
                <span>Payment cycle</span>
                <input name="paymentCycle" type="hidden" value={paymentCycle} />
                <div className="cycle-chip-grid" role="group" aria-label="Payment cycle">
                  {paymentCycleOptions.map((option) => (
                    <button
                      aria-pressed={paymentCycle === option.value}
                      className={`chip-button${paymentCycle === option.value ? " is-active" : ""}`}
                      key={option.value}
                      onClick={() => setPaymentCycle(option.value)}
                      type="button"
                    >
                      {option.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span>Current due date</span>
                <div className="date-field">
                  <span className="date-field__display">
                    {dueDate ? formatDate(dueDate) : "Choose date"}
                  </span>
                  <span className="date-field__hint">Change</span>
                  <input
                    aria-label="Current due date"
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
                <small>Suggested from payment cycle. You can edit it.</small>
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
                  Use suggested date
                </button>
              ) : null}

              <div className="sheet-actions">
                <AuthSubmitButton
                  forcePending={isPreviewPending}
                  pendingLabel="Creating..."
                >
                  Create loan
                </AuthSubmitButton>
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Cancel
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
