"use client";

import { type FormEvent, useActionState, useState } from "react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { usePreviewStore } from "@/components/preview/preview-store";
import { receivePaymentAction } from "@/lib/payments/actions";
import type { PaymentActionState } from "@/lib/payments/types";

const initialState: PaymentActionState = {
  status: "idle",
  message: "",
};

type ReceivePaymentSheetProps = {
  loanId: string;
  totalDue: number;
  unpaidInterest?: number;
  disabled?: boolean;
  label?: string;
};

export function ReceivePaymentSheet({
  loanId,
  totalDue,
  unpaidInterest = 0,
  disabled,
  label = "Receive payment",
}: ReceivePaymentSheetProps) {
  const previewStore = usePreviewStore();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [state, formAction] = useActionState(receivePaymentAction, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();

    const paymentAmount = Number(new FormData(event.currentTarget).get("amount"));

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setPreviewMessage("Preview mode: enter a valid payment amount.");
      return;
    }

    previewStore.receivePayment(loanId, paymentAmount);
    setPreviewMessage("Preview mode: payment simulated.");
    setAmount("");
    setIsOpen(false);
  }

  return (
    <>
      <div className="sheet-trigger-group">
        <button
          className="action-button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <span aria-hidden="true">+</span>
          {label}
        </button>
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
                <p>Current due: {formatMoney(totalDue)}</p>
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

              <label className="field">
                <span>Payment amount</span>
                <input
                  aria-describedby="payment-amount-hint"
                  inputMode="decimal"
                  min="0.01"
                  name="amount"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={String(totalDue)}
                  required
                  step="0.01"
                  type="number"
                  value={amount}
                />
                <small id="payment-amount-hint">
                  Enter the actual amount received. Extra becomes credit.
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
                <button
                  className="form-button form-button--secondary"
                  disabled={unpaidInterest <= 0}
                  onClick={() => setAmount(String(unpaidInterest))}
                  type="button"
                >
                  Clear unpaid
                </button>
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
                <AuthSubmitButton pendingLabel="Recording payment...">
                  Record payment
                </AuthSubmitButton>
                {state.status === "success" ? (
                  <button
                    className="form-button form-button--secondary"
                    onClick={() => {
                      setIsOpen(false);
                      setAmount("");
                    }}
                    type="button"
                  >
                    Done
                  </button>
                ) : null}
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
