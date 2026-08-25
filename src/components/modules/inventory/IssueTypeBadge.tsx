import type { IssueType } from "@/types";
import { getIssueTypeLabel } from "@/lib/inventory";
import { cn } from "@/lib/utils";

const typeClass: Record<IssueType, string> = {
  CUTTING: "bg-sky-50 text-sky-700",
  PRINTING: "bg-violet-50 text-violet-700",
  STITCHING: "bg-amber-50 text-amber-800",
  FINISHING: "bg-emerald-50 text-emerald-700",
  SAMPLE: "bg-slate-100 text-slate-700",
  PATTERN: "bg-orange-50 text-orange-700",
};

interface IssueTypeBadgeProps {
  type: IssueType;
}

export function IssueTypeBadge({ type }: IssueTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        typeClass[type]
      )}
    >
      {getIssueTypeLabel(type)}
    </span>
  );
}
