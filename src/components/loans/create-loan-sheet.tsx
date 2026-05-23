"use client";

import { useState } from "react";
import { createLoanFormAction } from "@/lib/loans/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export function CreateLoanSheet() {
  const [isOpen, setIsOpen] = useState(false);

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
            className="sheet"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <h2>New loan</h2>
                <p>Add the core terms. Payment history starts after creation.</p>
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

            <form action={createLoanFormAction} className="auth-form">
              <label className="field">
                <span>Borrower</span>
                <input
                  autoComplete="name"
                  name="borrowerName"
                  placeholder="Borrower name"
                  required
                  type="text"
                />
                <small>Use the name you will recognize in the loan list.</small>
              </label>

              <label className="field">
                <span>Principal</span>
                <input
                  aria-describedby="principal-hint"
                  inputMode="decimal"
                  min="0.01"
                  name="principal"
                  placeholder="10000"
                  required
                  step="0.01"
                  type="number"
                />
                <small id="principal-hint">Original amount lent, before interest.</small>
              </label>

              <label className="field">
                <span>Interest rate</span>
                <input
                  aria-describedby="interest-hint"
                  inputMode="decimal"
                  min="0"
                  name="interestRate"
                  placeholder="8"
                  required
                  step="0.01"
                  type="number"
                />
                <small id="interest-hint">Enter a percent value, for example 8.</small>
              </label>

              <label className="field">
                <span>Payment cycle</span>
                <select defaultValue="monthly" name="paymentCycle" required>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <small>Used for organization only in this phase.</small>
              </label>

              <label className="field">
                <span>Current due date</span>
                <input name="currentDueDate" required type="date" />
                <small>The next date this loan should appear as due.</small>
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
