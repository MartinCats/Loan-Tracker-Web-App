import Link from "next/link";
import { signInAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { isPreviewMode } from "@/lib/preview";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;
  const previewMode = isPreviewMode();

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Secure access</p>
        <h1>Sign in</h1>
        <p>
          Use your email and password to open the standalone loan tracker.
        </p>
        <AuthForm action={signInAction} mode="sign-in" next={next} />
        {previewMode ? (
          <div className="preview-callout">
            <span>Preview Mode</span>
            <p>Local preview is using mock data. Supabase login is still required outside preview.</p>
            <Link className="form-button form-button--secondary" href="/dashboard">
              Open preview dashboard
            </Link>
          </div>
        ) : null}
        <p className="auth-switch">
          New here? <Link href="/auth/sign-up">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
