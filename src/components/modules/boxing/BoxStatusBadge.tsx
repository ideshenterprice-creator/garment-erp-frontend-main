import type { BoxStatus } from "@/mock/boxing";
import { cn } from "@/lib/utils";

const statusClass: Record<BoxStatus, string> = {
  LOADED: "bg-emerald-50 text-emerald-700",
  PACKED: "bg-teal-50 text-teal-700",
  PENDING: "bg-slate-100 text-slate-600",
};

interface BoxStatusBadgeProps {
  status: BoxStatus;
}

export function BoxStatusBadge({ status }: BoxStatusBadgeProps) {
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
