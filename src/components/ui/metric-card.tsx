import { cn } from "@/lib/cn";

type MetricCardProps = {
  label: string;
  value: string;
  tone?: "gold";
};

export function MetricCard({ label, value, tone }: MetricCardProps) {
  return (
    <article className={cn("metric-card", tone === "gold" && "metric-card--gold")}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
