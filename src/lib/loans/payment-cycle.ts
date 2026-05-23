import type { PaymentCycle } from "@/lib/types/loan";

export const paymentCycleOptions: Array<{
  label: string;
  shortLabel: string;
  value: PaymentCycle;
}> = [
  { label: "Monthly", shortLabel: "Monthly", value: "monthly" },
  { label: "Every 10 days", shortLabel: "Every 10 days", value: "every_10_days" },
  { label: "Weekly", shortLabel: "Weekly", value: "weekly" },
  { label: "Daily", shortLabel: "Daily", value: "daily" },
];

const paymentCycleLabels: Record<PaymentCycle, string> = {
  biweekly: "Biweekly",
  daily: "Daily",
  every_10_days: "Every 10 days",
  monthly: "Monthly",
  weekly: "Weekly",
};

export function formatPaymentCycle(cycle: PaymentCycle) {
  return paymentCycleLabels[cycle];
}
