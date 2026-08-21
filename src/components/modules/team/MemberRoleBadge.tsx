import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface MemberRoleBadgeProps {
  role: UserRole;
}

export function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        role === "ADMIN"
          ? "bg-[#1b3a3a] text-white"
          : "bg-slate-100 text-slate-600"
      )}
    >
      {role === "ADMIN" ? "Admin" : "Team Member"}
    </span>
  );
}
