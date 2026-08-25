import type { POItem, Stock } from "@/types";
import type { SizeLabel } from "@/types";

const SIZE_ROWS: Array<{ key: keyof POItem; label: string; sizeLabel: SizeLabel }> =
  [
    { key: "qty_0_3M", label: "0-3M", sizeLabel: "SIZE_0_3M" },
    { key: "qty_3_6M", label: "3-6M", sizeLabel: "SIZE_3_6M" },
    { key: "qty_6_9M", label: "6-9M", sizeLabel: "SIZE_6_9M" },
    { key: "qty_9_12M", label: "9-12M", sizeLabel: "SIZE_9_12M" },
    { key: "qty_12_18M", label: "12-18M", sizeLabel: "SIZE_12_18M" },
    { key: "qty_18_24M", label: "18-24M", sizeLabel: "SIZE_18_24M" },
  ];

export interface SalesDraftItemSeed {
  poItemId: string;
  designNumber: string;
  garmentType: string;
  color: string;
  size: string;
  sizeLabel: SizeLabel;
}

export function poItemsToBillDraftItems(items: POItem[]): SalesDraftItemSeed[] {
  const rows: SalesDraftItemSeed[] = [];
  for (const item of items) {
    for (const size of SIZE_ROWS) {
      const qty = Number(item[size.key] ?? 0);
      if (qty > 0) {
        rows.push({
          poItemId: item.id,
          designNumber: item.designNumber,
          garmentType: item.garmentType,
          color: item.color,
          size: size.label,
          sizeLabel: size.sizeLabel,
        });
      }
    }
  }
  return rows;
}

export function finishedStockForDesignSize(
  stockItems: Stock[],
  designNumber: string,
  sizeLabel: string
): { productId: string | null; available: number } {
  const design = designNumber.trim().toLowerCase();
  if (!design) return { productId: null, available: 0 };

  const matches = stockItems.filter((item) => {
    if (item.product.category !== "FINISHED_GOOD") return false;
    const name = (item.product.name ?? "").toLowerCase();
    const code = (item.product.productCode ?? "").toLowerCase();
    return name.includes(design) || code.includes(design);
  });

  if (matches.length === 0) return { productId: null, available: 0 };

  // Prefer product whose name/code mentions the size, else sum all matching design stock
  const sizeKey = sizeLabel.replace("SIZE_", "").replace(/_/g, "-").toLowerCase();
  const sized = matches.find((item) => {
    const name = (item.product.name ?? "").toLowerCase();
    const code = (item.product.productCode ?? "").toLowerCase();
    return name.includes(sizeKey) || code.includes(sizeKey);
  });

  if (sized) {
    return {
      productId: sized.productId,
      available: Number(sized.quantity ?? 0),
    };
  }

  return {
    productId: matches[0].productId,
    available: matches.reduce(
      (sum, item) => sum + Number(item.quantity ?? 0),
      0
    ),
  };
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
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

export const SALES_PAYMENT_MODES = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CASH", label: "Cash" },
] as const;
