const assert = require("node:assert/strict");
const test = require("node:test");
const {
  filterActiveCollectorLoans,
  filterCollectorLoansByProfileIds,
  filterCollectorLoansByRange,
  getCollectorCountdown,
  getCollectorShareUnavailableReason,
  groupCollectorLoansByDueDate,
} = require("../src/lib/collector-board/calculator.ts");
const {
  buildCollectorPath,
  buildCollectorUrl,
} = require("../src/lib/collector-board/share-link.ts");

function makeLoan(overrides = {}) {
  return {
    id: "loan-a",
    userId: "user-a",
    lenderProfileId: "profile-a",
    borrowerName: "Borrower A",
    principal: 10000,
    interestRate: 10,
    paymentCycle: "monthly",
    currentDueDate: "2026-06-10",
    accumulatedProfit: 0,
    unpaidInterest: 0,
    creditBalance: 0,
    status: "active",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    amountDue: 1000,
    isCollected: false,
    lenderProfile: {
      id: "profile-a",
      name: "Profile A",
      avatarEmoji: "👤",
      themeColor: "green",
    },
    ...overrides,
  };
}

test("collector share availability marks invalid and inactive links", () => {
  assert.equal(getCollectorShareUnavailableReason(null), "invalid");
  assert.equal(getCollectorShareUnavailableReason({ isActive: false }), "inactive");
  assert.equal(getCollectorShareUnavailableReason({ isActive: true }), null);
});

test("collector share availability handles missing server configuration", () => {
  assert.equal(getCollectorShareUnavailableReason(null, false), "not_configured");
});

test("collector share links encode the token consistently", () => {
  assert.equal(
    buildCollectorPath("abc/def+ghi"),
    "/collect/abc%2Fdef%2Bghi",
  );
  assert.equal(
    buildCollectorUrl("https://netracker.vercel.app/", "abc/def+ghi"),
    "https://netracker.vercel.app/collect/abc%2Fdef%2Bghi",
  );
});

test("collector range includes today, tomorrow, and 2 days for next 2 days filter", () => {
  const loans = [
    makeLoan({ id: "today", currentDueDate: "2026-06-10" }),
    makeLoan({ id: "tomorrow", currentDueDate: "2026-06-11" }),
    makeLoan({ id: "two-days", currentDueDate: "2026-06-12" }),
    makeLoan({ id: "three-days", currentDueDate: "2026-06-13" }),
  ];

  assert.deepEqual(
    filterCollectorLoansByRange(loans, "next_2_days", "2026-06-10").map(
      (loan) => loan.id,
    ),
    ["today", "tomorrow", "two-days"],
  );
});

test("collector today filter excludes tomorrow and later loans", () => {
  const loans = [
    makeLoan({ id: "today", currentDueDate: "2026-06-10" }),
    makeLoan({ id: "tomorrow", currentDueDate: "2026-06-11" }),
  ];

  assert.deepEqual(
    filterCollectorLoansByRange(loans, "today", "2026-06-10").map(
      (loan) => loan.id,
    ),
    ["today"],
  );
});

test("collector month filter shows only loans in the current month", () => {
  const loans = [
    makeLoan({ id: "may", currentDueDate: "2026-05-31" }),
    makeLoan({ id: "june", currentDueDate: "2026-06-10" }),
    makeLoan({ id: "july", currentDueDate: "2026-07-01" }),
  ];

  assert.deepEqual(
    filterCollectorLoansByRange(loans, "month", "2026-06-10").map(
      (loan) => loan.id,
    ),
    ["june"],
  );
});

test("collector all filter keeps overdue and future visible active loans", () => {
  const loans = [
    makeLoan({ id: "overdue", currentDueDate: "2026-06-01" }),
    makeLoan({ id: "future", currentDueDate: "2026-08-01" }),
  ];

  assert.deepEqual(
    filterCollectorLoansByRange(loans, "all", "2026-06-10").map(
      (loan) => loan.id,
    ),
    ["overdue", "future"],
  );
});

test("collector profile filtering shows only selected lender profiles", () => {
  const loans = [
    makeLoan({ id: "profile-a", lenderProfile: { ...makeLoan().lenderProfile, id: "profile-a" } }),
    makeLoan({ id: "profile-b", lenderProfile: { ...makeLoan().lenderProfile, id: "profile-b" } }),
    makeLoan({ id: "profile-c", lenderProfile: { ...makeLoan().lenderProfile, id: "profile-c" } }),
  ];

  assert.deepEqual(
    filterCollectorLoansByProfileIds(loans, ["profile-a", "profile-c"]).map(
      (loan) => loan.id,
    ),
    ["profile-a", "profile-c"],
  );
});

test("collector active filtering excludes closed loans", () => {
  const loans = [
    makeLoan({ id: "active", status: "active" }),
    makeLoan({ id: "closed", status: "closed" }),
  ];

  assert.deepEqual(
    filterActiveCollectorLoans(loans).map((loan) => loan.id),
    ["active"],
  );
});

test("collector loans group by due date and sort dates ascending", () => {
  const groups = groupCollectorLoansByDueDate([
    makeLoan({ id: "second", borrowerName: "B", currentDueDate: "2026-06-12" }),
    makeLoan({ id: "first", borrowerName: "A", currentDueDate: "2026-06-10" }),
    makeLoan({ id: "first-b", borrowerName: "C", currentDueDate: "2026-06-10" }),
  ]);

  assert.deepEqual(
    groups.map((group) => group.dueDate),
    ["2026-06-10", "2026-06-12"],
  );
  assert.deepEqual(
    groups[0].loans.map((loan) => loan.id),
    ["first", "first-b"],
  );
});

test("collector grouped loans move collected/no-due items to the bottom of a date", () => {
  const groups = groupCollectorLoansByDueDate([
    makeLoan({ id: "collected", borrowerName: "A", isCollected: true }),
    makeLoan({ id: "due", borrowerName: "B", isCollected: false }),
  ]);

  assert.deepEqual(
    groups[0].loans.map((loan) => loan.id),
    ["due", "collected"],
  );
});

test("collector countdown labels cover today, tomorrow, 2 days, future, overdue, and collected", () => {
  assert.deepEqual(getCollectorCountdown("2026-06-10", "2026-06-10"), {
    daysUntilDue: 0,
    en: "TODAY",
    th: "วันนี้",
    tone: "today",
  });
  assert.deepEqual(getCollectorCountdown("2026-06-11", "2026-06-10"), {
    daysUntilDue: 1,
    en: "1 DAY",
    th: "1 วัน",
    tone: "soon",
  });
  assert.deepEqual(getCollectorCountdown("2026-06-12", "2026-06-10"), {
    daysUntilDue: 2,
    en: "2 DAYS",
    th: "2 วัน",
    tone: "soon",
  });
  assert.deepEqual(getCollectorCountdown("2026-06-20", "2026-06-10"), {
    daysUntilDue: 10,
    en: "10 DAYS",
    th: "10 วัน",
    tone: "future",
  });
  assert.deepEqual(getCollectorCountdown("2026-06-09", "2026-06-10"), {
    daysUntilDue: -1,
    en: "OVERDUE",
    th: "เกินกำหนด",
    tone: "overdue",
  });
  assert.deepEqual(getCollectorCountdown("2026-06-10", "2026-06-10", true), {
    daysUntilDue: 0,
    en: "COLLECTED",
    th: "เก็บแล้ว",
    tone: "collected",
  });
});
