import type { PaymentHistory } from "@/lib/types/loan";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

type ActivityEventType = PaymentHistory["type"];

type ActivityEvent = Omit<PaymentHistory, "type"> & {
  type: ActivityEventType;
};

type EventPresentation = {
  accent: string;
  description: string;
  label: string;
};

const eventPresentation: Record<ActivityEventType, EventPresentation> = {
  payment_received: {
    accent: "gold",
    description: "Full interest received",
    label: "Payment received",
  },
  partial_payment: {
    accent: "amber",
    description: "Partial interest received",
    label: "Partial payment",
  },
  overpayment: {
    accent: "teal",
    description: "Extra held as credit",
    label: "Overpayment",
  },
  reschedule: {
    accent: "blue",
    description: "Due date changed",
    label: "Rescheduled",
  },
  rescheduled: {
    accent: "blue",
    description: "Due date changed",
    label: "Rescheduled",
  },
  loan_closed: {
    accent: "rose",
    description: "Loan moved to archive",
    label: "Loan closed",
  },
  loan_created: {
    accent: "gold",
    description: "Loan created",
    label: "Loan created",
  },
};

type PaymentTimelineProps = {
  payments: PaymentHistory[];
};

export function PaymentTimeline({ payments }: PaymentTimelineProps) {
  const events = payments.map((payment) => payment as ActivityEvent);
  const groups = groupEventsByMonth(events);

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
      {groups.map((group) => (
        <section className="timeline-group" key={group.label}>
          <h3>{group.label}</h3>
          <div className="timeline-group__items">
            {group.events.map((event) => (
              <TimelineEventItem event={event} key={event.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TimelineEventItem({ event }: { event: ActivityEvent }) {
  const presentation = eventPresentation[event.type];

  return (
    <article className={`timeline-item timeline-item--${presentation.accent}`}>
      <div>
        <h4>{presentation.label}</h4>
        <p>{event.note || presentation.description}</p>
        <time dateTime={event.createdAt}>
          {formatActivityTimestamp(event.createdAt)}
        </time>
      </div>
      <strong>{money.format(event.amount)}</strong>
    </article>
  );
}

function groupEventsByMonth(events: ActivityEvent[]) {
  const groups = new Map<string, ActivityEvent[]>();

  for (const event of [...events].sort(
    (a, b) => getTime(b.createdAt) - getTime(a.createdAt),
  )) {
    const label = formatMonthGroup(event.createdAt);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }

  return [...groups.entries()].map(([label, groupEvents]) => ({
    events: groupEvents,
    label,
  }));
}

function formatMonthGroup(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Undated";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatActivityTimestamp(value: string) {
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
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (dayDifference === 0) {
    return `Today • ${time}`;
  }

  if (dayDifference === 1) {
    return `Yesterday • ${time}`;
  }

  return `${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)} • ${time}`;
}

function getTime(value: string) {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
