const assert = require("node:assert/strict");
const test = require("node:test");
const {
  formatDueLoanReminderMessages,
  groupDueLoanReminders,
} = require("../src/lib/notifications/due-loans.ts");

function makeReminder(overrides = {}) {
  return {
    lenderProfile: {
      id: "profile-fox",
      name: "กัน",
      avatarEmoji: "🦊",
      themeColor: "green",
    },
    borrowerName: "ทดสอบแจ้งเตือน",
    amountDue: 1000,
    daysUntilDue: 0,
    principalAmount: 10000,
    dueDate: "2026-05-27",
    ...overrides,
  };
}

test("groups due loan reminders by lender profile", () => {
  const groups = groupDueLoanReminders([
    makeReminder(),
    makeReminder({ borrowerName: "อีกคน" }),
    makeReminder({
      lenderProfile: {
        id: "profile-cat",
        name: "แมว",
        avatarEmoji: "🐱",
        themeColor: "rose",
      },
    }),
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].loans.length, 2);
  assert.equal(groups[1].lenderProfile.id, "profile-cat");
});

test("formats Discord due loan reminder with count, due amount, principal, and date", () => {
  const [message] = formatDueLoanReminderMessages({
    lenderProfile: {
      id: "profile-fox",
      name: "กัน",
      avatarEmoji: "🦊",
      themeColor: "green",
    },
    loans: [makeReminder()],
  });

  assert.match(message, /🟢 🦊 กัน/);
  assert.match(message, /🔴 วันนี้ครบกำหนด 1 รายการ/);
  assert.match(message, /👤 ลูกหนี้: ทดสอบแจ้งเตือน/);
  assert.match(message, /💰 ต้องจ่ายวันนี้: ฿1,000/);
  assert.match(message, /เงินต้น: ฿10,000/);
  assert.match(message, /📅 วันที่ครบกำหนด:/);
});

test("formats multiple due loans as separate Discord items", () => {
  const [message] = formatDueLoanReminderMessages({
    lenderProfile: {
      id: "profile-fox",
      name: "กัน",
      avatarEmoji: "🦊",
      themeColor: "green",
    },
    loans: [
      makeReminder(),
      makeReminder({ borrowerName: "รายการที่สอง", amountDue: 500 }),
    ],
  });

  assert.match(message, /🔴 วันนี้ครบกำหนด 2 รายการ/);
  assert.match(message, /รายการที่ 1/);
  assert.match(message, /รายการที่ 2/);
  assert.match(message, /รายการที่สอง/);
});

test("does not format due tomorrow reminder section", () => {
  const messages = formatDueLoanReminderMessages({
    lenderProfile: {
      id: "profile-fox",
      name: "กัน",
      avatarEmoji: "🦊",
      themeColor: "green",
    },
    loans: [makeReminder({ daysUntilDue: 1 })],
  });

  assert.equal(messages.length, 0);
});

test("formats due in 2 days reminder wording", () => {
  const [message] = formatDueLoanReminderMessages({
    lenderProfile: {
      id: "profile-fox",
      name: "กัน",
      avatarEmoji: "🦊",
      themeColor: "green",
    },
    loans: [makeReminder({ daysUntilDue: 2 })],
  });

  assert.match(message, /🟡 อีก 2 วันครบกำหนด 1 รายการ/);
  assert.match(message, /💰 ต้องจ่ายในอีก 2 วัน: ฿1,000/);
});

test("formats mixed due window reminders in separate sections", () => {
  const [message] = formatDueLoanReminderMessages({
    lenderProfile: {
      id: "profile-fox",
      name: "กัน",
      avatarEmoji: "🦊",
      themeColor: "green",
    },
    loans: [
      makeReminder({ borrowerName: "วันนี้", daysUntilDue: 0 }),
      makeReminder({ borrowerName: "พรุ่งนี้", daysUntilDue: 1 }),
      makeReminder({ borrowerName: "อีกสองวัน", daysUntilDue: 2 }),
    ],
  });

  assert.match(message, /🔴 วันนี้ครบกำหนด 1 รายการ/);
  assert.doesNotMatch(message, /🟠 พรุ่งนี้ครบกำหนด/);
  assert.match(message, /🟡 อีก 2 วันครบกำหนด 1 รายการ/);
});

test("can prefix lender profile blocks with a Discord separator", () => {
  const [message] = formatDueLoanReminderMessages(
    {
      lenderProfile: {
        id: "profile-dog",
        name: "แนน",
        avatarEmoji: "🐶",
        themeColor: "blue",
      },
      loans: [makeReminder()],
    },
    { includeProfileSeparator: true },
  );

  assert.match(message, /^━━━━━━━━━━━━━━\n\n🔵 🐶 แนน/);
});
