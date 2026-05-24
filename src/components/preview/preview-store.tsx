"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { previewLoans, previewPayments } from "@/lib/preview-data";
import { formatMoney } from "@/lib/format/money";
import {
  calculateCloseLoanSettlement,
  calculatePayment,
} from "@/lib/payments/calculator";
import type { Loan, PaymentCycle, PaymentHistory } from "@/lib/types/loan";

type PreviewCreateLoanInput = {
  borrowerName: string;
  principal: number;
  interestRate: number;
  paymentCycle: PaymentCycle;
  currentDueDate: string;
};

type PreviewStoreValue = {
  isPreviewMode: true;
  loans: Loan[];
  payments: PaymentHistory[];
  addLoan: (input: PreviewCreateLoanInput) => Loan;
  archiveLoan: (loanId: string) => void;
  closeLoan: (
    loanId: string,
    amountReceived?: number,
    note?: string,
  ) => { error?: string } | null;
  deleteLoan: (loanId: string) => void;
  receivePayment: (
    loanId: string,
    amount: number,
    note?: string,
  ) => { nextDueDate?: string } | null;
  rescheduleLoan: (loanId: string, currentDueDate: string) => void;
};

const PreviewStoreContext = createContext<PreviewStoreValue | null>(null);

export function PreviewProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loans, setLoans] = useState<Loan[]>(() =>
    previewLoans.map((loan) => ({ ...loan })),
  );
  const [payments, setPayments] = useState<PaymentHistory[]>(() =>
    previewPayments.map((payment) => ({ ...payment })),
  );

  const addLoan = useCallback((input: PreviewCreateLoanInput) => {
    const timestamp = new Date().toISOString();
    const loan: Loan = {
      id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: "preview-user",
      borrowerName: input.borrowerName,
      principal: input.principal,
      interestRate: input.interestRate,
      paymentCycle: input.paymentCycle,
      currentDueDate: input.currentDueDate,
      accumulatedProfit: 0,
      unpaidInterest: 0,
      creditBalance: 0,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setLoans((current) => [loan, ...current]);

    return loan;
  }, []);

  const archiveLoan = useCallback((loanId: string) => {
    setLoans((current) =>
      current.map((loan) =>
        loan.id === loanId && loan.status === "active"
          ? { ...loan, status: "closed", updatedAt: new Date().toISOString() }
          : loan,
      ),
    );
  }, []);

  const closeLoan = useCallback((loanId: string, amountReceived?: number, note?: string) => {
    const loan = loans.find(
      (item) => item.id === loanId && item.status === "active",
    );

    if (!loan) {
      return null;
    }

    const settlement = calculateCloseLoanSettlement(loan, amountReceived);

    if (!settlement.isPayoffSatisfied) {
      return {
        error: "Amount received is less than the payoff amount.",
      };
    }

    const timestamp = new Date().toISOString();
    const paymentHistory: PaymentHistory = {
      id: `preview-close-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: "preview-user",
      loanId,
      type: "loan_closed",
      amount: settlement.amountReceived,
      note: formatSettlementHistoryNote(settlement, note?.trim() ?? ""),
      createdAt: timestamp,
    };

    setLoans((current) =>
      current.map((loan) =>
        loan.id === loanId && loan.status === "active"
          ? {
              ...loan,
              accumulatedProfit: settlement.accumulatedProfit,
              creditBalance: settlement.creditBalance,
              status: "closed",
              unpaidInterest: settlement.unpaidInterest,
              updatedAt: timestamp,
            }
          : loan,
      ),
    );
    setPayments((current) => [paymentHistory, ...current]);

    return {};
  }, [loans]);

  const deleteLoan = useCallback((loanId: string) => {
    setLoans((current) => current.filter((loan) => loan.id !== loanId));
    setPayments((current) =>
      current.filter((payment) => payment.loanId !== loanId),
    );
  }, []);

  const receivePayment = useCallback((loanId: string, amount: number, note?: string) => {
    const loan = loans.find(
      (item) => item.id === loanId && item.status === "active",
    );

    if (!loan) {
      return null;
    }

    const payment = calculatePayment(loan, amount);
    const paymentHistory: PaymentHistory = {
      id: `preview-payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: "preview-user",
      loanId,
      type: payment.historyType,
      amount,
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setLoans((current) =>
      current.map((loan) => {
        if (loan.id !== loanId || loan.status !== "active") {
          return loan;
        }

        return {
          ...loan,
          accumulatedProfit: payment.accumulatedProfit,
          unpaidInterest: payment.unpaidInterest,
          creditBalance: payment.creditBalance,
          currentDueDate: payment.nextDueDate ?? loan.currentDueDate,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    setPayments((current) => [paymentHistory, ...current]);
    return { nextDueDate: payment.nextDueDate ?? undefined };
  }, [loans]);

  const rescheduleLoan = useCallback((loanId: string, currentDueDate: string) => {
    const currentLoan = loans.find(
      (loan) => loan.id === loanId && loan.status === "active",
    );

    if (!currentLoan) {
      return;
    }

    const timestamp = new Date().toISOString();

    setLoans((current) =>
      current.map((loan) => {
        if (loan.id !== loanId || loan.status !== "active") {
          return loan;
        }

        return {
          ...loan,
          currentDueDate,
          updatedAt: timestamp,
        };
      }),
    );
    setPayments((current) => [
      {
        id: `preview-reschedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: "preview-user",
        loanId,
        type: "rescheduled",
        amount: 0,
        note: `From: ${formatDateForHistory(currentLoan.currentDueDate)}\nTo: ${formatDateForHistory(currentDueDate)}`,
        createdAt: timestamp,
      },
      ...current,
    ]);
  }, [loans]);

  const value = useMemo<PreviewStoreValue>(
    () => ({
      isPreviewMode: true,
      loans,
      payments,
      addLoan,
      archiveLoan,
      closeLoan,
      deleteLoan,
      receivePayment,
      rescheduleLoan,
    }),
    [
      addLoan,
      archiveLoan,
      closeLoan,
      deleteLoan,
      loans,
      payments,
      receivePayment,
      rescheduleLoan,
    ],
  );

  return (
    <PreviewStoreContext.Provider value={value}>
      {children}
    </PreviewStoreContext.Provider>
  );
}

export function usePreviewStore() {
  return useContext(PreviewStoreContext);
}

function formatSettlementHistoryNote(
  settlement: ReturnType<typeof calculateCloseLoanSettlement>,
  note: string,
) {
  const lines = [
    `Total settlement received: ${formatMoney(settlement.amountReceived)}`,
    `Principal returned: ${formatMoney(settlement.principalReturn)}`,
    `Final interest received: ${formatMoney(settlement.finalInterestReceived)}`,
    `Credit applied: ${formatMoney(settlement.creditApplied)}`,
  ];

  if (settlement.overpayment > 0) {
    lines.push(`Extra received: ${formatMoney(settlement.overpayment)}`);
  }

  if (note) {
    lines.push(`Note: ${note}`);
  }

  return lines.join("\n");
}

function formatDateForHistory(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
