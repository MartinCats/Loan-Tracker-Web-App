"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { previewLoans } from "@/lib/preview-data";
import { calculatePayment } from "@/lib/payments/calculator";
import type { Loan, PaymentCycle } from "@/lib/types/loan";

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
  addLoan: (input: PreviewCreateLoanInput) => Loan;
  archiveLoan: (loanId: string) => void;
  receivePayment: (loanId: string, amount: number) => void;
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

  const receivePayment = useCallback((loanId: string, amount: number) => {
    setLoans((current) =>
      current.map((loan) => {
        if (loan.id !== loanId || loan.status !== "active") {
          return loan;
        }

        const payment = calculatePayment(loan, amount);

        return {
          ...loan,
          accumulatedProfit: payment.accumulatedProfit,
          unpaidInterest: payment.unpaidInterest,
          creditBalance: payment.creditBalance,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const rescheduleLoan = useCallback((loanId: string, currentDueDate: string) => {
    setLoans((current) =>
      current.map((loan) => {
        if (loan.id !== loanId || loan.status !== "active") {
          return loan;
        }

        return {
          ...loan,
          currentDueDate,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const value = useMemo<PreviewStoreValue>(
    () => ({
      isPreviewMode: true,
      loans,
      addLoan,
      archiveLoan,
      receivePayment,
      rescheduleLoan,
    }),
    [addLoan, archiveLoan, loans, receivePayment, rescheduleLoan],
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
