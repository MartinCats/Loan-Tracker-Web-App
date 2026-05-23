import { PageHeader } from "@/components/ui/page-header";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const settings = [
  ["Authentication", "Email/password planned for Phase 2"],
  ["Database", "Supabase schema and RLS planned for Phase 2"],
  ["PWA", "Install shell and manifest prepared"],
  ["Backup", "Export flow planned for Phase 3"],
] as const;

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configuration placeholders only. No real auth or database calls are made in Phase 1."
      />

      <section className="panel settings-list">
        {settings.map(([label, value]) => (
          <div className="settings-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
        <div className="settings-row">
          <span>Supabase env</span>
          <strong>{supabase.isConfigured ? "Variables present" : "Not set"}</strong>
        </div>
      </section>
    </main>
  );
}
