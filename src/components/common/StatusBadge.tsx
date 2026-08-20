import { cn } from "@/lib/utils";

type BadgeVariant =
  | "buyer"
  | "supplier"
  | "karigar"
  | "active"
  | "inactive"
  | "raw_material"
  | "finished_good"
  | "accessory"
  | "wastage"
  | "cutting"
  | "printing"
  | "coloring"
  | "stitching"
  | "finishing"
  | "zero_rated"
  | "cgst_sgst"
  | "igst"
  | "paid"
  | "pending"
  | "piece_rate"
  | "weekly_salary"
  | "both"
  | "discontinued"
  | "tracking"
  | "default";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  withDot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  buyer: "bg-sky-100 text-sky-700",
  supplier: "bg-amber-100 text-amber-800",
  karigar: "bg-violet-100 text-violet-700",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-red-100 text-red-700",
  raw_material: "bg-slate-100 text-slate-700",
  finished_good: "bg-emerald-50 text-emerald-700",
  accessory: "bg-orange-50 text-orange-700",
  wastage: "bg-slate-100 text-slate-600",
  cutting: "bg-orange-100 text-orange-700",
  printing: "bg-violet-100 text-violet-700",
  coloring: "bg-rose-100 text-rose-700",
  stitching: "bg-slate-100 text-slate-600",
  finishing: "bg-emerald-100 text-emerald-700",
  zero_rated: "bg-emerald-100 text-emerald-700",
  cgst_sgst: "bg-orange-100 text-orange-800",
  igst: "bg-indigo-100 text-indigo-700",
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  piece_rate: "bg-sky-100 text-sky-700",
  weekly_salary: "bg-amber-100 text-amber-800",
  both: "bg-violet-100 text-violet-700",
  discontinued: "bg-orange-100 text-orange-700",
  tracking: "bg-blue-100 text-blue-700",
  default: "bg-slate-100 text-slate-700",
};

const dotClasses: Partial<Record<BadgeVariant, string>> = {
  active: "bg-emerald-500",
  inactive: "bg-red-500",
  discontinued: "bg-orange-500",
  tracking: "bg-blue-500",
};

export function StatusBadge({
  label,
  variant = "default",
  className,
  withDot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {withDot ? (
        <span
          className={cn("size-1.5 rounded-full", dotClasses[variant] ?? "bg-current")}
        />
      ) : null}
      {label}
    </span>
  );
}
