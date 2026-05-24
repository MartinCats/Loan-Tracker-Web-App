"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";
import { useI18n } from "@/lib/i18n/use-i18n";
import { deleteLoanWithState, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

type DeleteLoanButtonProps = {
  afterDeleteHref?: string;
  loanId: string;
  variant?: "button" | "text";
};

export function DeleteLoanButton({
  afterDeleteHref,
  loanId,
  variant = "button",
}: DeleteLoanButtonProps) {
  const { t } = useI18n();
  const router = useRouter();
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [state, formAction] = useActionState(deleteLoanWithState, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsConfirming(false);
      showFeedback(t("feedback.loanDeleted"));
      router.refresh();

      if (afterDeleteHref) {
        router.replace(afterDeleteHref);
      }
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [afterDeleteHref, router, showFeedback, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();
    setIsPreviewPending(true);
    window.setTimeout(() => {
      previewStore.deleteLoan(loanId);
      setPreviewMessage("Preview mode: loan deleted.");
      showFeedback(t("feedback.loanDeleted"));
      setIsConfirming(false);
      setIsPreviewPending(false);

      if (afterDeleteHref) {
        router.replace(afterDeleteHref);
      }
    }, 120);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        <button
          className={
            variant === "text"
              ? "text-button text-button--danger"
              : "action-button action-button--danger"
          }
          onClick={() => {
            setPreviewMessage("");
            setIsConfirming(true);
          }}
          type="button"
        >
          {t("delete.action")}
        </button>
        {!isConfirming && (previewMessage || state.message) ? (
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

      {isConfirming ? (
        <div className="sheet-backdrop" role="presentation">
          <section
            aria-label={t("delete.title")}
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>{t("delete.title")}</h2>
                <p>{t("delete.description")}</p>
              </div>
              <button
                aria-label={t("delete.close")}
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
              <input
                name="afterDeleteHref"
                type="hidden"
                value={afterDeleteHref ?? "/dashboard"}
              />

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
                  {t("common.cancel")}
                </button>
                <DeleteSubmitButton forcePending={isPreviewPending} />
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function DeleteSubmitButton({ forcePending = false }: { forcePending?: boolean }) {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  const isPending = pending || forcePending;

  return (
    <button
      aria-busy={isPending}
      className="form-button form-button--danger"
      disabled={isPending}
      type="submit"
    >
      {isPending ? t("delete.deleting") : t("delete.action")}
    </button>
  );
}
