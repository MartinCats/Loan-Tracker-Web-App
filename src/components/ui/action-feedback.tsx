"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";

type FeedbackTone = "success" | "error";

type Feedback = {
  id: number;
  message: string;
  tone: FeedbackTone;
};

type ActionFeedbackContextValue = {
  showFeedback: (message: string, tone?: FeedbackTone) => void;
};

const ActionFeedbackContext =
  createContext<ActionFeedbackContextValue | null>(null);

export function ActionFeedbackProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showFeedback = useCallback(
    (message: string, tone: FeedbackTone = "success") => {
      setFeedback({ id: Date.now(), message, tone });
    },
    [],
  );

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 3200);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const value = useMemo(() => ({ showFeedback }), [showFeedback]);

  return (
    <ActionFeedbackContext.Provider value={value}>
      {children}
      <RouteFeedbackBridge showFeedback={showFeedback} />
      {feedback ? (
        <div
          className={`action-feedback action-feedback--${feedback.tone}`}
          key={feedback.id}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true" className="action-feedback__dot" />
          <span>{feedback.message}</span>
        </div>
      ) : null}
    </ActionFeedbackContext.Provider>
  );
}

function RouteFeedbackBridge({
  showFeedback,
}: {
  showFeedback: (message: string, tone?: FeedbackTone) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const feedback = searchParams.get("feedback");

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const messageKey = getFeedbackMessageKey(feedback);

    if (messageKey) {
      showFeedback(t(messageKey));
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("feedback");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [feedback, pathname, router, searchParams, showFeedback, t]);

  return null;
}

function getFeedbackMessageKey(feedback: string): MessageKey | null {
  switch (feedback) {
    case "loan-moved":
      return "feedback.loanMoved";
    case "loan-deleted":
      return "feedback.loanDeleted";
    case "profile-created":
      return "feedback.profileCreated";
    case "profile-saved":
      return "feedback.profileSaved";
    case "profile-deleted":
      return "feedback.profileDeleted";
    case "profile-switched":
      return "feedback.profileSwitched";
    default:
      return null;
  }
}

export function useActionFeedback() {
  const context = useContext(ActionFeedbackContext);

  if (!context) {
    return {
      showFeedback: () => undefined,
    };
  }

  return context;
}
