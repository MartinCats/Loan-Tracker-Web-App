import { formatDueLabel } from "@/lib/loans/urgency";

export function DueDateLabel({
  dueDate,
  todayDate,
}: {
  dueDate: string;
  todayDate: string;
}) {
  return <span>{formatDueLabel(dueDate, todayDate)}</span>;
}
