import type { SalesBillStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusClass: Record<SalesBillStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  SUBMITTED: "bg-sky-50 text-sky-700",
  DRAFT: "bg-slate-100 text-slate-600",
  RETURNED: "bg-red-50 text-red-700",
};

interface SalesBillStatusBadgeProps {
  status: SalesBillStatus;
}

export function SalesBillStatusBadge({ status }: SalesBillStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        statusClass[status]
      )}
    >
      {status}
    </span>
  );
}
