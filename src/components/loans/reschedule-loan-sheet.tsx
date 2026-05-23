"use client";

import { type FormEvent, useActionState, useEffect, useState } from "react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { rescheduleLoanAction, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

type RescheduleLoanSheetProps = {
  loanId: string;
  currentDueDate: string;
  disabled?: boolean;
};

export function RescheduleLoanSheet({
  loanId,
  currentDueDate,
  disabled,
}: RescheduleLoanSheetProps) {
  const previewStore = usePreviewStore();
  const [isOpen, setIsOpen] = useState(false);
  const [nextDueDate, setNextDueDate] = useState(currentDueDate);
  const [previewMessage, setPreviewMessage] = useState("");
  const [state, formAction] = useActionState(rescheduleLoanAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
    }
  }, [state.status]);

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

    previewStore.rescheduleLoan(loanId, nextDueDate);
    setPreviewMessage("Preview mode: reschedule simulated.");
    setIsOpen(false);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        <button
          className="action-button action-button--secondary"
          disabled={disabled}
          onClick={() => {
            setNextDueDate(currentDueDate);
            setPreviewMessage("");
            setIsOpen(true);
          }}
          type="button"
        >
          Reschedule
        </button>
        {!isOpen && (previewMessage || state.message) ? (
          <p
            className={
              previewMessage || state.status === "success"
                ? "auth-message is-success"
                : "auth-message"
            }
            role={state.status === "error" ? "alert" : "status"}
          >
            {previewMessage || state.message}
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

              <label className="field">
                <span>New due date</span>
                <input
                  name="currentDueDate"
                  onChange={(event) => setNextDueDate(event.target.value)}
                  required
                  type="date"
                  value={nextDueDate}
                />
              </label>

              {previewMessage || state.message ? (
                <p
                  className={
                    previewMessage || state.status === "success"
                      ? "auth-message is-success"
                      : "auth-message"
                  }
                  role={state.status === "error" ? "alert" : "status"}
                >
                  {previewMessage || state.message}
                </p>
              ) : null}

              <div className="sheet-actions">
                <AuthSubmitButton pendingLabel="Saving date...">
                  Save new due date
                </AuthSubmitButton>
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  {state.status === "success" ? "Done" : "Cancel"}
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
