import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  formatStr = "dd MMM yyyy"
): string {
  // Placeholder helper — date-fns formatting will be used in feature work
  void formatStr;
  return typeof date === "string" ? date : date.toISOString();
}
