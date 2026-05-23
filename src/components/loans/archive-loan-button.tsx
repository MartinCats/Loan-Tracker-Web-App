"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { usePreviewStore } from "@/components/preview/preview-store";
import { archiveLoanWithState, type LoanActionState } from "@/lib/loans/actions";

const initialState: LoanActionState = {
  status: "idle",
  message: "",
};

export function ArchiveLoanButton({ loanId }: { loanId: string }) {
  const previewStore = usePreviewStore();
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction] = useActionState(archiveLoanWithState, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewStore) {
      return;
    }

    event.preventDefault();
    previewStore.archiveLoan(loanId);
    setIsConfirming(false);
  }

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
    <form
      action={previewStore ? undefined : formAction}
      className="confirm-action"
      onSubmit={handleSubmit}
    >
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
