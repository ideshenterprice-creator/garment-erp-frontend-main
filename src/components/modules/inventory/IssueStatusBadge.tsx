import type { MockIssueDisplayStatus } from "@/mock/inventory";
import { cn } from "@/lib/utils";

const statusClass: Record<MockIssueDisplayStatus, string> = {
  RETURNED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-amber-50 text-amber-800",
  PENDING: "bg-slate-100 text-slate-600",
};

const statusLabel: Record<MockIssueDisplayStatus, string> = {
  RETURNED: "RETURNED",
  IN_PROGRESS: "IN PROGRESS",
  PENDING: "PENDING",
};

interface IssueStatusBadgeProps {
  status: MockIssueDisplayStatus;
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
