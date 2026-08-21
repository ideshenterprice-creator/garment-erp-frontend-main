import { cn } from "@/lib/utils";

interface MemberStatusBadgeProps {
  isActive: boolean;
}

export function MemberStatusBadge({ isActive }: MemberStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
