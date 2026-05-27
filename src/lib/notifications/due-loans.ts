import { formatMoney } from "@/lib/format/money";

const DISCORD_MESSAGE_LIMIT = 1900;

export type DueLoanReminder = {
  lenderProfile: {
    id: string;
    name: string;
    avatarEmoji: string;
  };
  borrowerName: string;
  amountDue: number;
  principalAmount: number;
  dueDate: string;
};

export type DueLoanReminderGroup = {
  lenderProfile: DueLoanReminder["lenderProfile"];
  loans: DueLoanReminder[];
};

export function groupDueLoanReminders(
  reminders: DueLoanReminder[],
): DueLoanReminderGroup[] {
  const groups = new Map<string, DueLoanReminderGroup>();

  for (const reminder of reminders) {
    const existingGroup = groups.get(reminder.lenderProfile.id);

    if (existingGroup) {
      existingGroup.loans.push(reminder);
      continue;
    }

    groups.set(reminder.lenderProfile.id, {
      lenderProfile: reminder.lenderProfile,
      loans: [reminder],
    });
  }

  return Array.from(groups.values());
}

export function formatDueLoanReminderMessages(
  group: DueLoanReminderGroup,
): string[] {
  const title = `${group.lenderProfile.avatarEmoji} ${group.lenderProfile.name}`;
  const header = `${title}\n  🔔 วันนี้ครบกำหนด ${group.loans.length} รายการ`;
  const messages: string[] = [];
  let currentMessage = header;

  for (const [index, loan] of group.loans.entries()) {
    const itemHeader = group.loans.length > 1 ? `\n\nรายการที่ ${index + 1}` : "";
    const line = `${itemHeader}\n👤 ลูกหนี้: ${loan.borrowerName}\n💰 ต้องจ่ายวันนี้: ${formatMoney(loan.amountDue)}\nเงินต้น: ${formatMoney(loan.principalAmount)}\n📅 วันที่ครบกำหนด: ${formatDueDate(loan.dueDate)}`;

    if (currentMessage.length + line.length > DISCORD_MESSAGE_LIMIT) {
      messages.push(currentMessage);
      currentMessage = `${header}${line}`;
      continue;
    }

    currentMessage += line;
  }

  messages.push(currentMessage);
  return messages;
}

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  }).format(new Date(`${date}T00:00:00+07:00`));
}
