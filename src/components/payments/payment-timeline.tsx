"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format/money";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { PaymentHistory } from "@/lib/types/loan";

type ActivityEventType = PaymentHistory["type"];

type ActivityEvent = Omit<PaymentHistory, "type"> & {
  type: ActivityEventType;
};

type EventPresentation = {
  accent: string;
  descriptionKey: MessageKey;
  labelKey: MessageKey;
};

const eventPresentation: Record<ActivityEventType, EventPresentation> = {
  payment_received: {
    accent: "gold",
    descriptionKey: "timeline.paymentReceivedDescription",
    labelKey: "timeline.paymentReceived",
  },
  partial_payment: {
    accent: "amber",
    descriptionKey: "timeline.partialPaymentDescription",
    labelKey: "timeline.partialPayment",
  },
  overpayment: {
    accent: "teal",
    descriptionKey: "timeline.overpaymentDescription",
    labelKey: "timeline.overpayment",
  },
  reschedule: {
    accent: "blue",
    descriptionKey: "timeline.rescheduledDescription",
    labelKey: "timeline.rescheduled",
  },
  rescheduled: {
    accent: "blue",
    descriptionKey: "timeline.rescheduledDescription",
    labelKey: "timeline.rescheduled",
  },
  loan_closed: {
    accent: "rose",
    descriptionKey: "timeline.loanClosedDescription",
    labelKey: "timeline.loanClosed",
  },
  loan_created: {
    accent: "gold",
    descriptionKey: "timeline.loanCreatedDescription",
    labelKey: "timeline.loanCreated",
  },
};

type PaymentTimelineProps = {
  payments: PaymentHistory[];
};

export function PaymentTimeline({ payments }: PaymentTimelineProps) {
  const { t } = useI18n();
  const [hasMounted, setHasMounted] = useState(false);
  const events = payments.map((payment) => payment as ActivityEvent);
  const groups = groupEventsByMonth(events, hasMounted, t);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (payments.length === 0) {
    return (
      <div className="empty-state">
        <h3>{t("timeline.noHistory")}</h3>
        <p>{t("timeline.noHistoryDescription")}</p>
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
              <TimelineEventItem
                event={event}
                key={event.id}
                t={t}
                useRelativeTime={hasMounted}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TimelineEventItem({
  event,
  t,
  useRelativeTime,
}: {
  event: ActivityEvent;
  t: ReturnType<typeof useI18n>["t"];
  useRelativeTime: boolean;
}) {
  const presentation = eventPresentation[event.type];

  return (
    <article className={`timeline-item timeline-item--${presentation.accent}`}>
      <div>
        <h4>{t(presentation.labelKey)}</h4>
        <p>{event.note || t(presentation.descriptionKey)}</p>
        <time dateTime={event.createdAt}>
          {formatActivityTimestamp(event.createdAt, useRelativeTime, t)}
        </time>
      </div>
      <strong>{formatMoney(event.amount)}</strong>
    </article>
  );
}

function groupEventsByMonth(
  events: ActivityEvent[],
  useLocalTime: boolean,
  t: ReturnType<typeof useI18n>["t"],
) {
  const groups = new Map<string, ActivityEvent[]>();

  for (const event of [...events].sort(
    (a, b) => getTime(b.createdAt) - getTime(a.createdAt),
  )) {
    const label = formatMonthGroup(event.createdAt, useLocalTime, t);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }

  return [...groups.entries()].map(([label, groupEvents]) => ({
    events: groupEvents,
    label,
  }));
}

function formatMonthGroup(
  value: string,
  useLocalTime: boolean,
  t: ReturnType<typeof useI18n>["t"],
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return t("timeline.undated");
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: useLocalTime ? undefined : "UTC",
    year: "numeric",
  }).format(date);
}

function formatActivityTimestamp(
  value: string,
  useRelativeTime: boolean,
  t: ReturnType<typeof useI18n>["t"],
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: useRelativeTime ? undefined : "UTC",
  }).format(date);

  if (useRelativeTime) {
    const now = new Date();
    const today = startOfLocalDay(now);
    const targetDay = startOfLocalDay(date);
    const dayDifference = Math.round(
      (today.getTime() - targetDay.getTime()) / 86_400_000,
    );

    if (dayDifference === 0) {
      return `${t("timeline.today")} \u2022 ${time}`;
    }

    if (dayDifference === 1) {
      return `${t("timeline.yesterday")} \u2022 ${time}`;
    }
  }

  return `${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: useRelativeTime ? undefined : "UTC",
    year: "numeric",
  }).format(date)} \u2022 ${time}`;
}

function getTime(value: string) {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
