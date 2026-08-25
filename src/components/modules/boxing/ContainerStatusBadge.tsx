import type { ContainerStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusClass: Record<ContainerStatus, string> = {
  LOADING: "bg-amber-50 text-amber-700",
  READY: "bg-teal-50 text-teal-700",
  DISPATCHED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-slate-100 text-slate-600",
};

interface ContainerStatusBadgeProps {
  status: ContainerStatus;
}

export function ContainerStatusBadge({ status }: ContainerStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        statusClass[status] ?? statusClass.PENDING
      )}
    >
      {status}
    </span>
  );
}
