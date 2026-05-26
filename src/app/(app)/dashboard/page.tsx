import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getActiveOrDefaultLenderProfile } from "@/lib/lender-profiles/default-profile";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getDashboardData } from "@/lib/loans/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { loans, metrics, error } = await getDashboardData();
  const supabase = await createClient();
  let activeLenderProfile = null;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { profile } = await getActiveOrDefaultLenderProfile(supabase, user);
      activeLenderProfile = profile;
    }
  }

  return (
    <DashboardContent
      activeLenderProfile={activeLenderProfile}
      error={error}
      initialLoans={loans}
      initialMetrics={metrics}
      todayDate={getTodayDateKey()}
    />
  );
}
