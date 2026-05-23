import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Email sign up</p>
        <h1>Create account</h1>
        <p>
          Start with email and password. If confirmation is enabled, Supabase
          will require email verification before sign in.
        </p>
        <AuthForm action={signUpAction} mode="sign-up" />
        <p className="auth-switch">
          Already have access? <Link href="/auth/sign-in">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
