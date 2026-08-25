export const ACCOUNT_PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
] as const;

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

/** ISO week number (1-53) for a UTC date, matching backend isoWeek helper. */
export function isoWeekNumber(date = new Date()): {
  week: number;
  year: number;
} {
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { week, year: target.getUTCFullYear() };
}

export function lastNWeekOptions(count = 8): Array<{
  value: string;
  label: string;
  weekNumber: number;
  year: number;
}> {
  const { week: currentWeek, year: currentYear } = isoWeekNumber();
  const options: Array<{
    value: string;
    label: string;
    weekNumber: number;
    year: number;
  }> = [];

  let week = currentWeek;
  let year = currentYear;
  for (let i = 0; i < count; i += 1) {
    const isCurrent = i === 0;
    options.push({
      value: `${year}-${week}`,
      label: isCurrent ? `Week ${week} (Current)` : `Week ${week}`,
      weekNumber: week,
      year,
    });
    week -= 1;
    if (week < 1) {
      year -= 1;
      week = 52;
    }
  }
  return options;
}

export function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
