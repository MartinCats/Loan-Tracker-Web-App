import { ActionButton } from "@/components/ui/action-button";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Phase 1</p>
        <h1>Sign in shell</h1>
        <p>
          Email/password authentication will be wired to Supabase in Phase 2.
          For now, use the app shell preview.
        </p>
        <ActionButton href="/dashboard">Open dashboard</ActionButton>
      </section>
    </main>
  );
}
