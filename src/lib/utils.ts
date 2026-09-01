import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as formatFns } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  const absolute = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absolute >= 1_00_00_000) {
    const crores = absolute / 1_00_00_000;
    return `${sign}₹${formatCompact(crores)} Cr`;
  }

  if (absolute >= 1_00_000) {
    const lakhs = absolute / 1_00_000;
    return `${sign}₹${formatCompact(lakhs)} L`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

function formatCompact(value: number): string {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
    minimumFractionDigits: 0,
  });
}

export function getMemberInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(
  date: string | Date,
  formatStr = "dd MMM yyyy"
): string {
  return formatFns(typeof date === "string" ? new Date(date) : date, formatStr);
}
