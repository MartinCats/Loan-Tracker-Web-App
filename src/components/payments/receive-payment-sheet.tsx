"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useState } from "react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { useActionFeedback } from "@/components/ui/action-feedback";
import { receivePaymentAction } from "@/lib/payments/actions";
import type { PaymentActionState } from "@/lib/payments/types";

const initialState: PaymentActionState = {
  status: "idle",
  message: "",
};

type ReceivePaymentSheetProps = {
  loanId: string;
  grossDue: number;
  creditApplied: number;
  totalDue: number;
  unpaidInterest?: number;
  disabled?: boolean;
  label?: string;
  onPaymentRecorded?: (details: { nextDueDate?: string }) => void;
  triggerVariant?: "button" | "card";
};

export function ReceivePaymentSheet({
  loanId,
  grossDue,
  creditApplied,
  totalDue,
  unpaidInterest = 0,
  disabled,
  label = "Receive payment",
  onPaymentRecorded,
  triggerVariant = "button",
}: ReceivePaymentSheetProps) {
  const router = useRouter();
  const previewStore = usePreviewStore();
  const { showFeedback } = useActionFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [state, formAction] = useActionState(receivePaymentAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
      setAmount("");
      showFeedback(
        state.nextDueDate
          ? "Payment recorded. Due date advanced."
          : "Payment recorded",
      );
      onPaymentRecorded?.({ nextDueDate: state.nextDueDate });
      router.refresh();
    } else if (state.status === "error" && state.message) {
      showFeedback(state.message, "error");
    }
  }, [onPaymentRecorded, router, showFeedback, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const paymentAmount = Number(formData.get("amount"));
    const note = String(formData.get("note") ?? "").trim();

    if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
      setPreviewMessage("Preview mode: enter a valid payment amount.");
      return;
    }

    if (paymentAmount === 0 && totalDue > 0) {
      setPreviewMessage("Preview mode: payment amount must be greater than zero.");
      return;
    }

    setIsPreviewPending(true);
    window.setTimeout(() => {
      const result = previewStore.receivePayment(
        loanId,
        paymentAmount,
        note || undefined,
      );
      setPreviewMessage("Preview mode: payment simulated.");
      showFeedback(
        result?.nextDueDate
          ? "Payment recorded. Due date advanced."
          : "Payment recorded",
      );
      onPaymentRecorded?.({ nextDueDate: result?.nextDueDate });
      setAmount("");
      setIsOpen(false);
      setIsPreviewPending(false);
    }, 120);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        {triggerVariant === "card" ? (
          <button
            className="quick-action-card quick-action-card--receive"
            disabled={disabled}
            onClick={() => setIsOpen(true)}
            type="button"
          >
            <span aria-hidden="true" className="quick-action-card__icon">$</span>
            <strong>{label}</strong>
            <small>Record interest</small>
          </button>
        ) : (
          <button
            className="action-button"
            disabled={disabled}
            onClick={() => setIsOpen(true)}
            type="button"
          >
            <span aria-hidden="true">+</span>
            {label}
          </button>
        )}
        {!isOpen && previewMessage ? (
          <p className="auth-message is-success" role="status">
            {previewMessage}
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <div className="sheet-backdrop" role="presentation">
          <section
            aria-label="Receive payment"
            aria-modal="true"
            className="sheet sheet--compact"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>Receive payment</h2>
                <p>Amount to pay now: {formatMoney(totalDue)}</p>
              </div>
              <button
                aria-label="Close receive payment sheet"
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

              <div className="payment-due-summary" aria-label="Payment due summary">
                <div>
                  <span>Gross due</span>
                  <strong>{formatMoney(grossDue)}</strong>
                </div>
                <div>
                  <span>Credit applied</span>
                  <strong>{formatMoney(creditApplied)}</strong>
                </div>
                <div>
                  <span>Pay now</span>
                  <strong>{formatMoney(totalDue)}</strong>
                </div>
              </div>

              <label className="field">
                <span>Payment amount</span>
                <input
                  aria-describedby="payment-amount-hint"
                  inputMode="decimal"
                  min={totalDue === 0 ? "0" : "0.01"}
                  name="amount"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={String(totalDue)}
                  required
                  step="0.01"
                  type="number"
                  value={amount}
                />
                <small id="payment-amount-hint">
                  Credit is applied first. Extra payment becomes credit.
                </small>
              </label>

              <div className="quick-actions" aria-label="Quick payment amounts">
                <button
                  className="form-button form-button--secondary"
                  onClick={() => setAmount(String(totalDue))}
                  type="button"
                >
                  Full payment
                </button>
                {totalDue === 0 && creditApplied > 0 ? (
                  <button
                    className="form-button form-button--secondary"
                    onClick={() => setAmount("0")}
                    type="button"
                  >
                    Apply credit
                  </button>
                ) : (
                  <button
                    className="form-button form-button--secondary"
                    disabled={unpaidInterest <= 0}
                    onClick={() => setAmount(String(Math.max(unpaidInterest - creditApplied, 0)))}
                    type="button"
                  >
                    Clear unpaid
                  </button>
                )}
              </div>

              <label className="field">
                <span>Note</span>
                <input
                  autoComplete="off"
                  name="note"
                  placeholder="Optional"
                  type="text"
                />
                <small>Optional context for the payment history.</small>
              </label>

              {state.status === "error" && state.message ? (
                <p
                  className="auth-message"
                  role="alert"
                >
                  {state.message}
                </p>
              ) : null}

              <div className="sheet-actions">
                <AuthSubmitButton
                  forcePending={isPreviewPending}
                  pendingLabel="Recording..."
                >
                  Record payment
                </AuthSubmitButton>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
