"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";
import { useI18n } from "@/lib/i18n/use-i18n";
import { rescheduleLoanAction, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

type RescheduleLoanSheetProps = {
  loanId: string;
  currentDueDate: string;
  disabled?: boolean;
  onRescheduled?: (details: { nextDueDate: string }) => void;
  triggerVariant?: "button" | "card";
};

export function RescheduleLoanSheet({
  loanId,
  currentDueDate,
  disabled,
  onRescheduled,
  triggerVariant = "button",
}: RescheduleLoanSheetProps) {
  const { t } = useI18n();
  const router = useRouter();
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [nextDueDate, setNextDueDate] = useState(currentDueDate);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const submittedDueDateRef = useRef(currentDueDate);
  const [state, formAction] = useActionState(rescheduleLoanAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
      showFeedback(t("feedback.dueDateUpdated"));
      onRescheduled?.({ nextDueDate: submittedDueDateRef.current });
      router.refresh();
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [onRescheduled, router, showFeedback, state]);

  useEffect(() => {
    if (!isOpen) {
      setNextDueDate(currentDueDate);
    }
  }, [currentDueDate, isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    submittedDueDateRef.current = nextDueDate;

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
      showFeedback(t("feedback.dueDateUpdated"));
      onRescheduled?.({ nextDueDate });
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
              <strong>{t("reschedule.title")}</strong>
              <small>{t("reschedule.moveDueDate")}</small>
            </>
          ) : (
            t("reschedule.title")
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
            aria-label={t("reschedule.title")}
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>{t("reschedule.title")}</h2>
                <p>{t("reschedule.description")}</p>
              </div>
              <button
                aria-label={t("reschedule.close")}
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
                <span>{t("reschedule.currentDueDate")}</span>
                <input readOnly type="text" value={formatDate(currentDueDate)} />
              </label>

              <div className="field">
                <span>{t("reschedule.newDueDate")}</span>
                <div className="date-field">
                  <span className="date-field__display">
                    {nextDueDate ? formatDate(nextDueDate) : t("create.chooseDate")}
                  </span>
                  <span className="date-field__hint">{t("common.change")}</span>
                  <input
                    aria-label={t("reschedule.newDueDate")}
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
                  pendingLabel={t("reschedule.saving")}
                >
                  {t("reschedule.save")}
                </AuthSubmitButton>
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  {t("common.cancel")}
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
