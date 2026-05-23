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
            <p>{payment.note || payment.createdAt}</p>
          </div>
          <strong>{money.format(payment.amount)}</strong>
        </article>
      ))}
    </div>
  );
}
