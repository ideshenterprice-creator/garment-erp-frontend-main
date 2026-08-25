import type { PurchaseBillStatus } from "@/types";

export function getBillStatusLabel(status: PurchaseBillStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending Approval";
    case "CONFIRMED":
      return "Confirmed";
    case "RETURNED":
      return "Returned";
  }
}
