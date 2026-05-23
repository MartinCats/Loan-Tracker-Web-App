"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { archiveLoanWithState, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

export function ArchiveLoanButton({ loanId }: { loanId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction] = useActionState(archiveLoanWithState, initialState);

  if (!isConfirming) {
    return (
      <>
        <button
          className="text-button"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          Archive
        </button>
        {state.status === "error" ? (
          <p className="inline-status is-error" role="alert">
            {state.message}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <form action={formAction} className="confirm-action">
      <input name="loanId" type="hidden" value={loanId} />
      <ArchiveSubmitButton />
      <button
        className="text-button text-button--muted"
        onClick={() => setIsConfirming(false)}
        type="button"
      >
        Cancel
      </button>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "inline-status is-success"
              : "inline-status is-error"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function ArchiveSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className="text-button text-button--danger"
      disabled={pending}
      type="submit"
    >
      {pending ? "Archiving..." : "Confirm archive"}
    </button>
  );
}
