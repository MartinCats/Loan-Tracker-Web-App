import { ArchivePageContent } from "@/components/loans/archive-page-content";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getLoans } from "@/lib/loans/queries";

export default async function ArchivePage() {
  const { loans, error } = await getLoans("closed");
  const todayDate = getTodayDateKey();

  return (
    <ArchivePageContent error={error} initialLoans={loans} todayDate={todayDate} />
  );
}
