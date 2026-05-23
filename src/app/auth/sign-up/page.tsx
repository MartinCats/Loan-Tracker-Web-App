import { ActionButton } from "@/components/ui/action-button";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Phase 1</p>
        <h1>Create account shell</h1>
        <p>
          Account creation is a visual placeholder until Supabase auth and RLS
          policies are implemented.
        </p>
        <ActionButton href="/dashboard">Preview app</ActionButton>
      </section>
    </main>
  );
}
