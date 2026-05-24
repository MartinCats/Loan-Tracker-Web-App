"use client";

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

export function useActionFeedback() {
  const context = useContext(ActionFeedbackContext);

  if (!context) {
    return {
      showFeedback: () => undefined,
    };
  }

  return context;
}
