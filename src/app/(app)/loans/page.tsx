import { LoansPageContent } from "@/components/loans/loans-page-content";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getLoans } from "@/lib/loans/queries";

export default async function LoansPage() {
  const { loans, error } = await getLoans("active");
  const todayDate = getTodayDateKey();

  return (
    <LoansPageContent error={error} initialLoans={loans} todayDate={todayDate} />
  );
}
