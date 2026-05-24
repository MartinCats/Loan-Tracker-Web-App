"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";
import { closeLoanWithState, type LoanActionState } from "@/lib/loans/actions";
import { formatMoney } from "@/lib/format/money";
import { useI18n } from "@/lib/i18n/use-i18n";
import { calculateCloseLoanSettlement } from "@/lib/payments/calculator";
import type { Loan } from "@/lib/types/loan";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

export function CloseLoanButton({
  loan,
  triggerVariant = "button",
}: {
  loan: Loan;
  triggerVariant?: "button" | "card";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const settlement = calculateCloseLoanSettlement(loan);
  const [isOpen, setIsOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState(String(settlement.totalPayoff));
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewStatus, setPreviewStatus] = useState<"idle" | "error" | "success">("idle");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [state, formAction] = useActionState(closeLoanWithState, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
      showFeedback(t("feedback.loanMoved"));
      router.replace(`/archive/${loan.id}`);
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [loan.id, router, showFeedback, state]);

  useEffect(() => {
    if (isOpen) {
      setAmountReceived(String(settlement.totalPayoff));
    }
  }, [isOpen, settlement.totalPayoff]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const received = Number(formData.get("amountReceived"));
    const note = String(formData.get("note") ?? "").trim();

    if (!Number.isFinite(received) || received < 0) {
      setPreviewStatus("error");
      setPreviewMessage("Preview mode: enter a valid settlement amount.");
      return;
    }

    setIsPreviewPending(true);
    window.setTimeout(() => {
      const result = previewStore.closeLoan(loan.id, received, note || undefined);

      if (result?.error) {
        setPreviewStatus("error");
        setPreviewMessage(result.error);
        showFeedback(result.error, "error");
        setIsPreviewPending(false);
        return;
      }

      setPreviewStatus("success");
      setPreviewMessage("Preview mode: loan closed.");
      showFeedback(t("feedback.loanMoved"));
      setIsOpen(false);
      setIsPreviewPending(false);
      router.replace(`/archive/${loan.id}`);
    }, 120);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        <button
          className={
            triggerVariant === "card"
              ? "quick-action-card quick-action-card--close"
              : "action-button action-button--danger"
          }
          onClick={() => {
            setPreviewMessage("");
            setPreviewStatus("idle");
            setIsOpen(true);
          }}
          type="button"
        >
          {triggerVariant === "card" ? (
            <>
              <span aria-hidden="true" className="quick-action-card__icon">X</span>
              <strong>{t("close.title")}</strong>
              <small>{t("close.finalPayoff")}</small>
            </>
          ) : (
            t("close.title")
          )}
        </button>
        {!isOpen && (previewMessage || state.message) ? (
          <p
            className={
              previewStatus === "success" || state.status === "success"
                ? "auth-message is-success"
                : "auth-message"
            }
            role={previewStatus === "error" || state.status === "error" ? "alert" : "status"}
          >
            {previewMessage || state.message}
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <div className="sheet-backdrop" role="presentation">
          <section
            aria-label={t("close.title")}
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>{t("close.title")}</h2>
                <p>{t("close.description")}</p>
              </div>
              <button
                aria-label={t("close.closeSheet")}
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
              <input name="loanId" type="hidden" value={loan.id} />

              <div className="settlement-summary" aria-label="Settlement summary">
                <div>
                  <span>{t("close.principalReturn")}</span>
                  <strong>{formatMoney(settlement.principalReturn)}</strong>
                </div>
                <div>
                  <span>{t("close.finalDue")}</span>
                  <strong>{formatMoney(settlement.grossDue)}</strong>
                </div>
                <div>
                  <span>{t("detail.creditApplied")}</span>
                  <strong>-{formatMoney(settlement.creditApplied)}</strong>
                </div>
                <div className="settlement-summary__total">
                  <span>{t("close.totalToCollect")}</span>
                  <strong>{formatMoney(settlement.totalPayoff)}</strong>
                </div>
              </div>

              <label className="field">
                <span>{t("close.amountReceived")}</span>
                <input
                  inputMode="decimal"
                  min="0"
                  name="amountReceived"
                  onChange={(event) => setAmountReceived(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={amountReceived}
                />
                <small>
                  {t("close.hint")}
                </small>
              </label>

              <label className="field">
                <span>{t("receive.note")}</span>
                <input
                  autoComplete="off"
                  name="note"
                  placeholder={t("common.optional")}
                  type="text"
                />
                <small>{t("close.noteHint")}</small>
              </label>

              {previewMessage || state.message ? (
                <p
                  className={
                    previewStatus === "success" || state.status === "success"
                      ? "auth-message is-success"
                      : "auth-message"
                  }
                  role={previewStatus === "error" || state.status === "error" ? "alert" : "status"}
                >
                  {previewMessage || state.message}
                </p>
              ) : null}

              <div className="sheet-actions">
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  {t("common.cancel")}
                </button>
                <CloseSubmitButton forcePending={isPreviewPending} />
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function CloseSubmitButton({ forcePending = false }: { forcePending?: boolean }) {
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
      {isPending ? t("close.closing") : t("close.title")}
    </button>
  );
}
