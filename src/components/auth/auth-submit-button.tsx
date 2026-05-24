"use client";

import { useFormStatus } from "react-dom";

export function AuthSubmitButton({
  children,
  forcePending = false,
  pendingLabel = "Working...",
}: Readonly<{
  children: React.ReactNode;
  forcePending?: boolean;
  pendingLabel?: string;
}>) {
  const { pending } = useFormStatus();
  const isPending = pending || forcePending;

  return (
    <button
      aria-busy={isPending}
      className="form-button"
      disabled={isPending}
      type="submit"
    >
      {isPending ? pendingLabel : children}
    </button>
  );
}
