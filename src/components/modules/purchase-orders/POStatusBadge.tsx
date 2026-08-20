import type { PurchaseOrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { getPOStatusLabel } from "@/mock/purchaseOrders";

interface POStatusBadgeProps {
  status: PurchaseOrderStatus;
  className?: string;
}

const statusClasses: Record<PurchaseOrderStatus, string> = {
  ACTIVE: "bg-sky-100 text-sky-700",
  IN_PRODUCTION: "bg-amber-100 text-amber-800",
  READY_TO_SHIP: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export function POStatusBadge({ status, className }: POStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClasses[status],
        className
      )}
    >
      {getPOStatusLabel(status).toUpperCase()}
    </span>
  );
}
