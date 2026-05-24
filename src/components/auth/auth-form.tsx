"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useI18n } from "@/lib/i18n/use-i18n";

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
  const { t } = useI18n();
  const [state, formAction] = useActionState(action, initialState);
  const isSignIn = mode === "sign-in";

  return (
    <form action={formAction} className="auth-form">
      <input name="next" type="hidden" value={next} />

      <label className="field">
        <span>{t("auth.email")}</span>
        <input
          aria-describedby={`${mode}-email-hint`}
          autoComplete="email"
          inputMode="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <small id={`${mode}-email-hint`}>{t("auth.emailHint")}</small>
      </label>

      <label className="field">
        <span>{t("auth.password")}</span>
        <input
          aria-describedby={`${mode}-password-hint`}
          autoComplete={isSignIn ? "current-password" : "new-password"}
          minLength={6}
          name="password"
          placeholder={t("auth.passwordPlaceholder")}
          required
          type="password"
        />
        <small id={`${mode}-password-hint`}>
          {isSignIn ? t("auth.passwordSignInHint") : t("auth.passwordSignUpHint")}
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

      <AuthSubmitButton pendingLabel={isSignIn ? t("auth.signingIn") : t("auth.creating")}>
        {isSignIn ? t("auth.signIn") : t("auth.createAccount")}
      </AuthSubmitButton>
    </form>
  );
}
