"use client";

import Link from "next/link";
import type { AuthState } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { useI18n } from "@/lib/i18n/use-i18n";

type AuthPageContentProps = {
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "sign-in" | "sign-up";
  next?: string;
  previewMode?: boolean;
};

export function AuthPageContent({
  action,
  mode,
  next,
  previewMode = false,
}: AuthPageContentProps) {
  const { t } = useI18n();
  const isSignIn = mode === "sign-in";

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">
          {isSignIn ? t("auth.secureAccess") : t("auth.emailSignUp")}
        </p>
        <h1>{isSignIn ? t("auth.signIn") : t("auth.createAccount")}</h1>
        <p>
          {isSignIn ? t("auth.signInDescription") : t("auth.signUpDescription")}
        </p>
        <AuthForm action={action} mode={mode} next={next} />
        {isSignIn && previewMode ? (
          <div className="preview-callout">
            <span>{t("common.previewMode")}</span>
            <p>{t("auth.previewDescription")}</p>
            <Link className="form-button form-button--secondary" href="/dashboard">
              {t("auth.openPreviewDashboard")}
            </Link>
          </div>
        ) : null}
        <p className="auth-switch">
          {isSignIn ? t("auth.newHere") : t("auth.alreadyHaveAccess")}{" "}
          <Link href={isSignIn ? "/auth/sign-up" : "/auth/sign-in"}>
            {isSignIn ? t("auth.createAccount") : t("auth.signIn")}
          </Link>
        </p>
      </section>
    </main>
  );
}
