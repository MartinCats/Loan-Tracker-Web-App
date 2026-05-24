import type { PaymentHistory } from "@/lib/types/loan";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const labels: Record<PaymentHistory["type"], string> = {
  payment_received: "Payment received",
  partial_payment: "Partial payment",
  overpayment: "Overpayment",
  reschedule: "Reschedule",
  loan_closed: "Loan closed",
};

const fallbackDescriptions: Record<PaymentHistory["type"], string> = {
  payment_received: "Full interest received",
  partial_payment: "Partial interest received",
  overpayment: "Extra held as credit",
  reschedule: "Due date changed",
  loan_closed: "Loan moved to archive",
};

type PaymentTimelineProps = {
  payments: PaymentHistory[];
};

export function PaymentTimeline({ payments }: PaymentTimelineProps) {
  if (payments.length === 0) {
    return (
      <div className="empty-state">
        <h3>No payment history</h3>
        <p>Received payments will appear here as a simple timeline.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {payments.map((payment) => (
        <article className="timeline-item" key={payment.id}>
          <div>
            <h3>{labels[payment.type]}</h3>
            <p>{payment.note || fallbackDescriptions[payment.type]}</p>
            <time dateTime={payment.createdAt}>
              {formatPaymentDate(payment.createdAt)}
            </time>
          </div>
          <strong>{money.format(payment.amount)}</strong>
        </article>
      ))}
    </div>
  );
}

function formatPaymentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const today = startOfLocalDay(now);
  const targetDay = startOfLocalDay(date);
  const dayDifference = Math.round(
    (today.getTime() - targetDay.getTime()) / 86_400_000,
  );
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (dayDifference === 0) {
    return `Today, ${time}`;
  }

  if (dayDifference === 1) {
    return `Yesterday, ${time}`;
  }

  return `${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)} · ${time}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
