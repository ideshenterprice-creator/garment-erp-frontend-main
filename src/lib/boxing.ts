import type { SizeBreakdown, Stock } from "@/types";
import {
  emptySizeBreakdown,
  sumSizeBreakdown,
} from "@/lib/production";

export { emptySizeBreakdown as emptyBoxSizes, sumSizeBreakdown as sumBoxSizes };

export type BoxSizeQty = SizeBreakdown;

export function finishedStockAvailable(
  stockItems: Stock[],
  designNumber: string,
  color: string
): number {
  const design = designNumber.trim().toLowerCase();
  const colorKey = color.trim().toLowerCase();
  if (!design) return 0;

  return stockItems.reduce((sum, item) => {
    const name = (item.product.name ?? "").toLowerCase();
    const code = (item.product.productCode ?? "").toLowerCase();
    const matchesDesign = name.includes(design) || code.includes(design);
    const matchesColor =
      !colorKey || name.includes(colorKey) || code.includes(colorKey);
    if (!matchesDesign || !matchesColor) return sum;
    return sum + Number(item.quantity ?? 0);
  }, 0);
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}
