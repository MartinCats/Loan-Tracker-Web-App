import { formatMoney } from "@/lib/format/money";

const DISCORD_MESSAGE_LIMIT = 1900;
const PROFILE_SEPARATOR = "━━━━━━━━━━━━━━";

export type DueLoanReminder = {
  lenderProfile: {
    avatarEmoji: string;
    id: string;
    name: string;
    themeColor?: string;
  };
  borrowerName: string;
  amountDue: number;
  daysUntilDue: 0 | 1 | 2;
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
  options: { includeProfileSeparator?: boolean } = {},
): string[] {
  const sections = groupLoansByDueTiming(group.loans);

  if (sections.length === 0) {
    return [];
  }

  const title = options.includeProfileSeparator
    ? `${PROFILE_SEPARATOR}\n\n${formatProfileTitle(group.lenderProfile)}`
    : formatProfileTitle(group.lenderProfile);
  const messages: string[] = [];
  let currentMessage = title;

  for (const section of sections) {
    const dueCopy = getDueTimingCopy(section.daysUntilDue);
    const sectionHeader = `\n\n${dueCopy.heading} ${section.loans.length} รายการ`;
    const sectionBody = section.loans
      .map((loan, index) => {
        const itemHeader = `รายการที่ ${index + 1}`;

        return `${itemHeader}\n👤 ลูกหนี้: ${loan.borrowerName}\n💰 ${dueCopy.amountLabel}: ${formatMoney(loan.amountDue)}\nเงินต้น: ${formatMoney(loan.principalAmount)}\n📅 วันที่ครบกำหนด: ${formatDueDate(loan.dueDate)}`;
      })
      .join("\n\n");
    const line = `${sectionHeader}\n\n${sectionBody}`;

    if (currentMessage.length + line.length > DISCORD_MESSAGE_LIMIT) {
      messages.push(currentMessage);
      currentMessage = `${title}${line}`;
      continue;
    }

    currentMessage += line;
  }

  messages.push(currentMessage);
  return messages;
}

export function getDueTimingCopy(daysUntilDue: 0 | 1 | 2) {
  if (daysUntilDue === 0) {
    return {
      amountLabel: "ต้องจ่ายวันนี้",
      heading: "🔴 วันนี้ครบกำหนด",
    };
  }

  if (daysUntilDue === 1) {
    return {
      amountLabel: "ต้องจ่ายพรุ่งนี้",
      heading: "🟠 พรุ่งนี้ครบกำหนด",
    };
  }

  return {
    amountLabel: "ต้องจ่ายในอีก 2 วัน",
    heading: "🟡 อีก 2 วันครบกำหนด",
  };
}

function groupLoansByDueTiming(loans: DueLoanReminder[]) {
  const groups = new Map<0 | 1 | 2, DueLoanReminder[]>();

  for (const loan of loans) {
    if (loan.daysUntilDue === 1) {
      continue;
    }

    groups.set(loan.daysUntilDue, [
      ...(groups.get(loan.daysUntilDue) ?? []),
      loan,
    ]);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([daysUntilDue, sectionLoans]) => ({
      daysUntilDue,
      loans: sectionLoans,
    }));
}

function formatProfileTitle(profile: DueLoanReminder["lenderProfile"]) {
  const themeMark = getThemeMark(profile.themeColor);
  return [themeMark, profile.avatarEmoji, profile.name].filter(Boolean).join(" ");
}

function getThemeMark(themeColor?: string) {
  if (themeColor === "green") {
    return "🟢";
  }

  if (themeColor === "gold") {
    return "🟡";
  }

  if (themeColor === "blue") {
    return "🔵";
  }

  if (themeColor === "rose") {
    return "🌹";
  }

  return "";
}

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  }).format(new Date(`${date}T00:00:00+07:00`));
}
