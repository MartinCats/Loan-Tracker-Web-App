import { signOutAction } from "@/app/auth/actions";
import { PageHeader } from "@/components/ui/page-header";
import { isPreviewMode } from "@/lib/preview";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const settings = [
  ["Authentication", "Email/password active"],
  ["Database", "Supabase schema and RLS planned for Phase 2"],
  ["PWA", "Install shell and manifest prepared"],
  ["Backup", "Export flow planned for Phase 3"],
] as const;

export default function SettingsPage() {
  const previewMode = isPreviewMode();

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Authentication is enabled. Loan data and database reads are still reserved for later phases."
      />

      <section className="panel settings-list">
        {settings.map(([label, value]) => (
          <div className="settings-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
        <div className="settings-row">
          <span>Preview mode</span>
          <strong>{previewMode ? "Enabled" : "Off"}</strong>
        </div>
        <div className="settings-row">
          <span>Supabase env</span>
          <strong>{isSupabaseConfigured() ? "Variables present" : "Not set"}</strong>
        </div>
        {previewMode ? (
          <div className="empty-state">
            <h3>Preview Mode</h3>
            <p>Protected pages are using mock data. Supabase auth remains unchanged outside preview.</p>
          </div>
        ) : (
          <form action={signOutAction} className="settings-action">
            <button className="form-button form-button--secondary" type="submit">
              Sign out
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
