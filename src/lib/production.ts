import type { SizeBreakdown } from "@/types";

export const SIZE_FIELD_KEYS = [
  "qty_0_3M",
  "qty_3_6M",
  "qty_6_9M",
  "qty_9_12M",
  "qty_12_18M",
  "qty_18_24M",
] as const;

export const SIZE_FIELD_LABELS: Record<(typeof SIZE_FIELD_KEYS)[number], string> =
  {
    qty_0_3M: "0-3M",
    qty_3_6M: "3-6M",
    qty_6_9M: "6-9M",
    qty_9_12M: "9-12M",
    qty_12_18M: "12-18M",
    qty_18_24M: "18-24M",
  };

export function emptySizeBreakdown(): SizeBreakdown {
  return {
    qty_0_3M: 0,
    qty_3_6M: 0,
    qty_6_9M: 0,
    qty_9_12M: 0,
    qty_12_18M: 0,
    qty_18_24M: 0,
  };
}

export function sumSizeBreakdown(sizes: SizeBreakdown): number {
  return (
    sizes.qty_0_3M +
    sizes.qty_3_6M +
    sizes.qty_6_9M +
    sizes.qty_9_12M +
    sizes.qty_12_18M +
    sizes.qty_18_24M
  );
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}
