import type { DashboardMetrics, Loan } from "@/lib/types/loan";

export const dashboardMetrics: DashboardMetrics = {
  lifetimeProfit: 18420,
  expectedProfit: 7350,
  principalActive: 64200,
  activeLoans: 6,
};

export const loanPreview: Loan[] = [
  {
    id: "loan_001",
    userId: "phase_1_user",
    borrowerName: "Mina Ch.",
    principal: 12500,
    interestRate: 8,
    paymentCycle: "monthly",
    currentDueDate: "2026-06-02",
    accumulatedProfit: 2400,
    status: "active",
    createdAt: "2026-03-01",
    updatedAt: "2026-05-22",
  },
  {
    id: "loan_002",
    userId: "phase_1_user",
    borrowerName: "Arun P.",
    principal: 9800,
    interestRate: 6,
    paymentCycle: "monthly",
    currentDueDate: "2026-06-11",
    accumulatedProfit: 1760,
    status: "active",
    createdAt: "2026-02-12",
    updatedAt: "2026-05-18",
  },
  {
    id: "loan_003",
    userId: "phase_1_user",
    borrowerName: "Nok S.",
    principal: 6000,
    interestRate: 5,
    paymentCycle: "weekly",
    currentDueDate: "2026-05-28",
    accumulatedProfit: 920,
    status: "closed",
    createdAt: "2026-01-08",
    updatedAt: "2026-05-03",
  },
];
