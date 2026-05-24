"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";
import { closeLoanWithState, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

export function CloseLoanButton({
  loanId,
  triggerVariant = "button",
}: {
  loanId: string;
  triggerVariant?: "button" | "card";
}) {
  const router = useRouter();
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [state, formAction] = useActionState(closeLoanWithState, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsConfirming(false);
      showFeedback("Loan moved to Archive");
      router.replace(`/archive/${loanId}`);
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [loanId, router, showFeedback, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();
    setIsPreviewPending(true);
    window.setTimeout(() => {
      previewStore.closeLoan(loanId);
      setPreviewMessage("Preview mode: loan closed.");
      showFeedback("Loan moved to Archive");
      setIsConfirming(false);
      setIsPreviewPending(false);
      router.replace(`/archive/${loanId}`);
    }, 120);
  }

  if (!isConfirming) {
    return (
      <div className="sheet-trigger-group">
        <button
          className={
            triggerVariant === "card"
              ? "quick-action-card quick-action-card--close"
              : "action-button action-button--danger"
          }
          onClick={() => {
            setPreviewMessage("");
            setIsConfirming(true);
          }}
          type="button"
        >
          {triggerVariant === "card" ? (
            <>
              <span aria-hidden="true" className="quick-action-card__icon">X</span>
              <strong>Close loan</strong>
              <small>Move to archive</small>
            </>
          ) : (
            "Close loan"
          )}
        </button>
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
      </div>
    );
  }

  return (
    <div className="sheet-backdrop" role="presentation">
      <section
        aria-label="Close loan confirmation"
        aria-modal="true"
        className="sheet sheet--compact"
        role="dialog"
      >
        <div className="section-heading">
          <div>
            <h2>Close loan?</h2>
            <p>This moves the loan to Archive. Payment history will be preserved.</p>
          </div>
          <button
            aria-label="Close confirmation"
            className="icon-button"
            onClick={() => setIsConfirming(false)}
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
            <button
              className="form-button form-button--secondary"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              Cancel
            </button>
            <CloseSubmitButton forcePending={isPreviewPending} />
          </div>
        </form>
      </section>
    </div>
  );
}

function CloseSubmitButton({ forcePending = false }: { forcePending?: boolean }) {
  const { pending } = useFormStatus();
  const isPending = pending || forcePending;

  return (
    <button
      aria-busy={isPending}
      className="form-button form-button--danger"
      disabled={isPending}
      type="submit"
    >
      {isPending ? "Closing..." : "Close loan"}
    </button>
  );
}
