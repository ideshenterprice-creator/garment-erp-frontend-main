import type {
  IssueType,
  ProductUnit,
  StockAdjustmentReason,
} from "@/types";

export type StockSortOption =
  | "lastUpdated"
  | "name"
  | "quantityDesc"
  | "quantityAsc";

export const ADJUSTMENT_REASON_OPTIONS: {
  label: string;
  value: StockAdjustmentReason;
}[] = [
  { label: "Physical Count Correction", value: "PHYSICAL_COUNT_CORRECTION" },
  { label: "Damaged", value: "DAMAGED" },
  { label: "Sample Used", value: "SAMPLE_USED" },
  { label: "Other", value: "OTHER" },
];

export const ISSUE_TYPE_OPTIONS: { label: string; value: IssueType }[] = [
  { label: "Cutting Issue", value: "CUTTING" },
  { label: "Printing Issue", value: "PRINTING" },
  { label: "Stitching Issue", value: "STITCHING" },
  { label: "Finishing Issue", value: "FINISHING" },
  { label: "Sample Issue", value: "SAMPLE" },
  { label: "Pattern Issue", value: "PATTERN" },
];

export function getIssueTypeLabel(type: IssueType): string {
  return ISSUE_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

export function getUnitLabel(unit: ProductUnit | string | undefined): string {
  if (unit === "KG") return "kg";
  if (unit === "PCS") return "pcs";
  if (unit === "METERS") return "meters";
  if (unit === "ROLLS") return "rolls";
  return "units";
}
