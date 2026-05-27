const assert = require("node:assert/strict");
const test = require("node:test");
const {
  formatDueLabel,
  getLoanUrgency,
  getUrgencyRank,
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
