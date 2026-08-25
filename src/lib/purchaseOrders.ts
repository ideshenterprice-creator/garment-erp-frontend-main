import type { PurchaseOrderStatus } from "@/types";

export const PAYMENT_TERMS_OPTIONS = [
  "CIF, 60 Days",
  "CIF, 30 Days",
  "LC at Sight",
  "Net 30",
  "Net 45",
] as const;

export function getPOStatusLabel(status: PurchaseOrderStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "IN_PRODUCTION":
      return "In Production";
    case "READY_TO_SHIP":
      return "Ready to Ship";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function getDeliveryDateClassName(
  deliveryDate: string | Date,
  status: PurchaseOrderStatus
): string {
  if (status === "COMPLETED" || status === "CANCELLED") {
    return "text-slate-700";
  }

  const delivery = new Date(deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  delivery.setHours(0, 0, 0, 0);

  const diffMs = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "text-red-600 font-semibold";
  if (diffDays <= 7) return "text-amber-600 font-semibold";
  return "text-slate-700";
}
