"use client";

import { useActionState, useState } from "react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
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
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(rescheduleLoanAction, initialState);

  return (
    <>
      <button
        className="action-button action-button--secondary"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Reschedule
      </button>

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

            <form action={formAction} className="auth-form auth-form--compact">
              <input name="loanId" type="hidden" value={loanId} />

              <label className="field">
                <span>Current due date</span>
                <input readOnly type="text" value={formatDate(currentDueDate)} />
              </label>

              <label className="field">
                <span>New due date</span>
                <input
                  defaultValue={currentDueDate}
                  name="currentDueDate"
                  required
                  type="date"
                />
              </label>

              {state.message ? (
                <p
                  className={
                    state.status === "success"
                      ? "auth-message is-success"
                      : "auth-message"
                  }
                  role={state.status === "error" ? "alert" : "status"}
                >
                  {state.message}
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
