"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

type AuthFormProps = {
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "sign-in" | "sign-up";
  next?: string;
};

const initialState: AuthState = {
  status: "idle",
  message: "",
};

export function AuthForm({ action, mode, next = "/dashboard" }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const isSignIn = mode === "sign-in";

  return (
    <form action={formAction} className="auth-form">
      <input name="next" type="hidden" value={next} />

      <label className="field">
        <span>Email</span>
        <input
          aria-describedby={`${mode}-email-hint`}
          autoComplete="email"
          inputMode="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <small id={`${mode}-email-hint`}>Use the email tied to this web app account.</small>
      </label>

      <label className="field">
        <span>Password</span>
        <input
          aria-describedby={`${mode}-password-hint`}
          autoComplete={isSignIn ? "current-password" : "new-password"}
          minLength={6}
          name="password"
          placeholder="Minimum 6 characters"
          required
          type="password"
        />
        <small id={`${mode}-password-hint`}>
          {isSignIn ? "Enter your account password." : "Use at least 6 characters."}
        </small>
      </label>

      {state.message ? (
        <p
          className={
            state.status === "success" ? "auth-message is-success" : "auth-message"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <AuthSubmitButton pendingLabel={isSignIn ? "Signing in..." : "Creating..."}>
        {isSignIn ? "Sign in" : "Create account"}
      </AuthSubmitButton>
    </form>
  );
}
