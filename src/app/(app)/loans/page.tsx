import { LoansPageContent } from "@/components/loans/loans-page-content";
import { getActiveOrDefaultLenderProfile } from "@/lib/lender-profiles/default-profile";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getLoans } from "@/lib/loans/queries";
import { createClient } from "@/lib/supabase/server";

export default async function LoansPage() {
  const { loans, error } = await getLoans("active");
  const todayDate = getTodayDateKey();
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
    <LoansPageContent
      activeLenderProfile={activeLenderProfile}
      error={error}
      initialLoans={loans}
      todayDate={todayDate}
    />
  );
}
