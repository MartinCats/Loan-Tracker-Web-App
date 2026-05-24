"use client";

import { type FormEvent, useActionState, useEffect, useState } from "react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";
import { rescheduleLoanAction, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

type RescheduleLoanSheetProps = {
  loanId: string;
  currentDueDate: string;
  disabled?: boolean;
  triggerVariant?: "button" | "card";
};

export function RescheduleLoanSheet({
  loanId,
  currentDueDate,
  disabled,
  triggerVariant = "button",
}: RescheduleLoanSheetProps) {
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [nextDueDate, setNextDueDate] = useState(currentDueDate);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [state, formAction] = useActionState(rescheduleLoanAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
      showFeedback("Due date updated");
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [showFeedback, state]);

  useEffect(() => {
    if (!isOpen) {
      setNextDueDate(currentDueDate);
    }
  }, [currentDueDate, isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();

    if (!nextDueDate) {
      setPreviewMessage("Preview mode: choose the new due date.");
      return;
    }

    setIsPreviewPending(true);
    window.setTimeout(() => {
      previewStore.rescheduleLoan(loanId, nextDueDate);
      setPreviewMessage("Preview mode: reschedule simulated.");
      showFeedback("Due date updated");
      setIsOpen(false);
      setIsPreviewPending(false);
    }, 120);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        <button
          className={
            triggerVariant === "card"
              ? "quick-action-card quick-action-card--reschedule"
              : "action-button action-button--secondary"
          }
          disabled={disabled}
          onClick={() => {
            setNextDueDate(currentDueDate);
            setPreviewMessage("");
            setIsOpen(true);
          }}
          type="button"
        >
          {triggerVariant === "card" ? (
            <>
              <span aria-hidden="true" className="quick-action-card__icon">10</span>
              <strong>Reschedule</strong>
              <small>Move due date</small>
            </>
          ) : (
            "Reschedule"
          )}
        </button>
        {!isOpen && previewMessage ? (
          <p
            className="auth-message is-success"
            role="status"
          >
            {previewMessage}
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <div className="sheet-backdrop" role="presentation">
          <section
            aria-label="Reschedule loan"
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>Reschedule</h2>
                <p>Choose the next due date for this active loan.</p>
              </div>
              <button
                aria-label="Close reschedule sheet"
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
              <input name="loanId" type="hidden" value={loanId} />

              <label className="field">
                <span>Current due date</span>
                <input readOnly type="text" value={formatDate(currentDueDate)} />
              </label>

              <div className="field">
                <span>New due date</span>
                <div className="date-field">
                  <span className="date-field__display">
                    {nextDueDate ? formatDate(nextDueDate) : "Choose date"}
                  </span>
                  <span className="date-field__hint">Change</span>
                  <input
                    aria-label="New due date"
                    className="date-field__native"
                    name="currentDueDate"
                    onChange={(event) => setNextDueDate(event.target.value)}
                    required
                    type="date"
                    value={nextDueDate}
                  />
                </div>
              </div>

              {previewMessage || (state.status === "error" && state.message) ? (
                <p
                  className={
                    previewMessage
                      ? "auth-message is-success"
                      : "auth-message"
                  }
                  role={state.status === "error" ? "alert" : "status"}
                >
                  {previewMessage || state.message}
                </p>
              ) : null}

              <div className="sheet-actions">
                <AuthSubmitButton
                  forcePending={isPreviewPending}
                  pendingLabel="Saving..."
                >
                  Save new due date
                </AuthSubmitButton>
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
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
