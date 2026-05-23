"use client";

import { useState } from "react";
import { createLoanFormAction } from "@/lib/loans/actions";
import { paymentCycleOptions } from "@/lib/loans/payment-cycle";
import type { PaymentCycle } from "@/lib/types/loan";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export function CreateLoanSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>("monthly");

  return (
    <>
      <button className="plain-button plain-button--primary" onClick={() => setIsOpen(true)} type="button">
        <span aria-hidden="true">+</span>
        Add loan
      </button>

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

            <form action={createLoanFormAction} className="auth-form auth-form--compact">
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

              <label className="field">
                <span>Current due date</span>
                <input name="currentDueDate" required type="date" />
              </label>

              <div className="sheet-actions">
                <AuthSubmitButton pendingLabel="Creating loan...">
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
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
