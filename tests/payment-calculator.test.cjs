const assert = require("node:assert/strict");
const test = require("node:test");
const {
  advanceDueDateByCycle,
} = require("../src/lib/loans/due-date.ts");
const {
  calculateCreditApplied,
  calculateExpectedDue,
  calculateGrossDue,
  calculatePayment,
  calculateTotalDue,
} = require("../src/lib/payments/calculator.ts");

function makeLoan(overrides = {}) {
  return {
    id: "loan-test",
    userId: "user-test",
    borrowerName: "Borrower",
    principal: 7200,
    interestRate: 7,
    paymentCycle: "monthly",
    currentDueDate: "2026-01-31",
    accumulatedProfit: 0,
    unpaidInterest: 504,
    creditBalance: 0,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("full payment with existing unpaid interest advances due date", () => {
  const loan = makeLoan();
  const payment = calculatePayment(loan, 1008);

  assert.equal(calculateExpectedDue(loan), 504);
  assert.equal(calculateGrossDue(loan), 1008);
  assert.equal(calculateTotalDue(loan), 1008);
  assert.equal(payment.creditApplied, 0);
  assert.equal(payment.accumulatedProfit, 1008);
  assert.equal(payment.unpaidInterest, 0);
  assert.equal(payment.creditBalance, 0);
  assert.equal(payment.historyType, "payment_received");
  assert.equal(payment.isCurrentDueSatisfied, true);
  assert.equal(payment.nextDueDate, "2026-02-28");
});

test("partial payment leaves unpaid interest and does not advance due date", () => {
  const loan = makeLoan();
  const payment = calculatePayment(loan, 500);

  assert.equal(calculateExpectedDue(loan), 504);
  assert.equal(calculateGrossDue(loan), 1008);
  assert.equal(calculateTotalDue(loan), 1008);
  assert.equal(payment.creditApplied, 0);
  assert.equal(payment.accumulatedProfit, 500);
  assert.equal(payment.unpaidInterest, 508);
  assert.equal(payment.creditBalance, 0);
  assert.equal(payment.historyType, "partial_payment");
  assert.equal(payment.isCurrentDueSatisfied, false);
  assert.equal(payment.nextDueDate, null);
});

test("overpayment stores extra credit and advances due date", () => {
  const loan = makeLoan();
  const payment = calculatePayment(loan, 1200);

  assert.equal(calculateExpectedDue(loan), 504);
  assert.equal(calculateGrossDue(loan), 1008);
  assert.equal(calculateTotalDue(loan), 1008);
  assert.equal(payment.creditApplied, 0);
  assert.equal(payment.accumulatedProfit, 1008);
  assert.equal(payment.unpaidInterest, 0);
  assert.equal(payment.creditBalance, 192);
  assert.equal(payment.historyType, "overpayment");
  assert.equal(payment.isCurrentDueSatisfied, true);
  assert.equal(payment.nextDueDate, "2026-02-28");
});

test("full current-cycle payment advances due date", () => {
  const loan = makeLoan({
    currentDueDate: "2026-05-20",
    unpaidInterest: 0,
  });
  const payment = calculatePayment(loan, 504);

  assert.equal(calculateExpectedDue(loan), 504);
  assert.equal(calculateGrossDue(loan), 504);
  assert.equal(calculateTotalDue(loan), 504);
  assert.equal(payment.creditApplied, 0);
  assert.equal(payment.accumulatedProfit, 504);
  assert.equal(payment.unpaidInterest, 0);
  assert.equal(payment.creditBalance, 0);
  assert.equal(payment.historyType, "payment_received");
  assert.equal(payment.isCurrentDueSatisfied, true);
  assert.equal(payment.nextDueDate, "2026-06-20");
});

test("credit balance reduces current due", () => {
  const loan = makeLoan({
    creditBalance: 192,
    unpaidInterest: 0,
  });

  assert.equal(calculateExpectedDue(loan), 504);
  assert.equal(calculateGrossDue(loan), 504);
  assert.equal(calculateCreditApplied(loan), 192);
  assert.equal(calculateTotalDue(loan), 312);
});

test("full payment after credit consumes credit and advances due date", () => {
  const loan = makeLoan({
    creditBalance: 192,
    currentDueDate: "2026-05-20",
    unpaidInterest: 0,
  });
  const payment = calculatePayment(loan, 312);

  assert.equal(payment.accumulatedProfit, 504);
  assert.equal(payment.creditApplied, 192);
  assert.equal(payment.unpaidInterest, 0);
  assert.equal(payment.creditBalance, 0);
  assert.equal(payment.historyType, "payment_received");
  assert.equal(payment.nextDueDate, "2026-06-20");
});

test("partial payment after credit consumes credit and keeps due date", () => {
  const loan = makeLoan({
    creditBalance: 192,
    currentDueDate: "2026-05-20",
    unpaidInterest: 0,
  });
  const payment = calculatePayment(loan, 100);

  assert.equal(payment.accumulatedProfit, 292);
  assert.equal(payment.creditApplied, 192);
  assert.equal(payment.unpaidInterest, 212);
  assert.equal(payment.creditBalance, 0);
  assert.equal(payment.historyType, "partial_payment");
  assert.equal(payment.nextDueDate, null);
});

test("credit can fully cover the current cycle", () => {
  const loan = makeLoan({
    creditBalance: 600,
    currentDueDate: "2026-05-20",
    unpaidInterest: 0,
  });
  const payment = calculatePayment(loan, 0);

  assert.equal(calculateTotalDue(loan), 0);
  assert.equal(payment.accumulatedProfit, 504);
  assert.equal(payment.creditApplied, 504);
  assert.equal(payment.unpaidInterest, 0);
  assert.equal(payment.creditBalance, 96);
  assert.equal(payment.historyType, "payment_received");
  assert.equal(payment.nextDueDate, "2026-06-20");
});

test("overpayment when credit already exists preserves extra as credit", () => {
  const loan = makeLoan({
    creditBalance: 192,
    currentDueDate: "2026-05-20",
    unpaidInterest: 0,
  });
  const payment = calculatePayment(loan, 400);

  assert.equal(calculateTotalDue(loan), 312);
  assert.equal(payment.accumulatedProfit, 504);
  assert.equal(payment.creditApplied, 192);
  assert.equal(payment.unpaidInterest, 0);
  assert.equal(payment.creditBalance, 88);
  assert.equal(payment.historyType, "overpayment");
  assert.equal(payment.nextDueDate, "2026-06-20");
});

test("due date advancement uses date-only cycle rules", () => {
  assert.equal(advanceDueDateByCycle("2026-01-31", "monthly"), "2026-02-28");
  assert.equal(advanceDueDateByCycle("2028-01-31", "monthly"), "2028-02-29");
  assert.equal(advanceDueDateByCycle("2026-05-20", "every_10_days"), "2026-05-30");
  assert.equal(advanceDueDateByCycle("2026-05-20", "weekly"), "2026-05-27");
  assert.equal(advanceDueDateByCycle("2026-05-20", "daily"), "2026-05-21");
});
