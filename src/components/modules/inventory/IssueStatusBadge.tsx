import type { IssueStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusClass: Record<IssueStatus, string> = {
  ISSUED: "bg-amber-50 text-amber-800",
  RETURNED: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-sky-50 text-sky-700",
};

const statusLabel: Record<IssueStatus, string> = {
  ISSUED: "ISSUED",
  RETURNED: "RETURNED",
  PARTIAL: "PARTIAL",
};

interface IssueStatusBadgeProps {
  status: IssueStatus;
}

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
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
