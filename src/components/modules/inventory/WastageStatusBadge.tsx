import type { WastageStatus } from "@/mock/inventory";
import { cn } from "@/lib/utils";

const statusClass: Record<WastageStatus, string> = {
  SOLD: "bg-emerald-50 text-emerald-700",
  IN_STOCK: "bg-teal-50 text-teal-700",
};

const statusLabel: Record<WastageStatus, string> = {
  SOLD: "SOLD",
  IN_STOCK: "IN STOCK",
};

interface WastageStatusBadgeProps {
  status: WastageStatus;
}

export function WastageStatusBadge({ status }: WastageStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        statusClass[status]
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
