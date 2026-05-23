import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { getDashboardData } from "@/lib/loans/queries";

export default async function DashboardPage() {
  const { loans, metrics, error } = await getDashboardData();

  return (
    <DashboardContent
      error={error}
      initialLoans={loans}
      initialMetrics={metrics}
      todayDate={getTodayDateKey()}
    />
  );
}
