import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { isPreviewMode } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isPreviewMode()) {
    return <AppShell isPreviewMode>{children}</AppShell>;
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
