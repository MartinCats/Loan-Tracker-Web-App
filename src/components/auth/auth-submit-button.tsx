"use client";

import { useFormStatus } from "react-dom";

export function AuthSubmitButton({
  children,
  pendingLabel = "Working...",
}: Readonly<{ children: React.ReactNode; pendingLabel?: string }>) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className="form-button"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
