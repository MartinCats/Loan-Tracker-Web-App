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
  const header = `${title}\nLoan payments due today`;
  const messages: string[] = [];
  let currentMessage = header;

  for (const loan of group.loans) {
    const line = `\n• ${loan.borrowerName}: ${formatMoney(loan.amountDue)} due ${formatDueDate(loan.dueDate)}`;

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
