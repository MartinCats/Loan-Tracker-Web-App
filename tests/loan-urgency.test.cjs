const assert = require("node:assert/strict");
const test = require("node:test");
const {
  formatDueLabel,
  getLoanUrgency,
  getUrgencyRank,
  getTodayDateKey,
} = require("../src/lib/loans/urgency.ts");

function makeLoan(currentDueDate) {
  return {
    currentDueDate,
    status: "active",
  };
}

test("loans due today have their own urgent state", () => {
  const todayLoan = makeLoan("2026-05-27");

  assert.equal(getLoanUrgency(todayLoan, "2026-05-27"), "due-today");
  assert.equal(formatDueLabel("2026-05-27", "2026-05-27"), "Due today");
});

test("due today ranks after overdue and before due soon", () => {
  assert.equal(
    getUrgencyRank(makeLoan("2026-05-26"), "2026-05-27") <
      getUrgencyRank(makeLoan("2026-05-27"), "2026-05-27"),
    true,
  );
  assert.equal(
    getUrgencyRank(makeLoan("2026-05-27"), "2026-05-27") <
      getUrgencyRank(makeLoan("2026-05-28"), "2026-05-27"),
    true,
  );
});

test("today date key uses Asia/Bangkok after local midnight", () => {
  const bangkokAfterMidnight = new Date("2026-06-09T17:33:00.000Z");

  assert.equal(getTodayDateKey(bangkokAfterMidnight), "2026-06-10");
});

test("Bangkok date status covers yesterday, today, and tomorrow", () => {
  const today = getTodayDateKey(new Date("2026-06-09T17:33:00.000Z"));

  assert.equal(getLoanUrgency(makeLoan("2026-06-09"), today), "overdue");
  assert.equal(formatDueLabel("2026-06-09", today), "Overdue by 1 day");
  assert.equal(getLoanUrgency(makeLoan("2026-06-10"), today), "due-today");
  assert.equal(formatDueLabel("2026-06-10", today), "Due today");
  assert.equal(getLoanUrgency(makeLoan("2026-06-11"), today), "due-soon");
  assert.equal(formatDueLabel("2026-06-11", today), "Tomorrow");
});
