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
  const feedback = searchParams.get("feedback");

  useEffect(() => {
    if (!feedback) {
      return;
    }

    if (feedback === "loan-moved") {
      showFeedback("Loan moved to Archive");
    } else if (feedback === "loan-deleted") {
      showFeedback("Loan deleted");
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("feedback");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [feedback, pathname, router, searchParams, showFeedback]);

  return null;
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
