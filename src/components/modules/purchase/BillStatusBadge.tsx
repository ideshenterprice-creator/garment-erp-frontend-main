import type { PurchaseBillStatus } from "@/types";
import { cn } from "@/lib/utils";
import { getBillStatusLabel } from "@/lib/purchase";

interface BillStatusBadgeProps {
  status: PurchaseBillStatus;
  className?: string;
}

const statusClasses: Record<PurchaseBillStatus, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  RETURNED: "bg-rose-100 text-rose-700",
};

export function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase",
        statusClasses[status],
        className
      )}
    >
      {getBillStatusLabel(status)}
    </span>
  );
}
