import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "blue" | "yellow" | "purple" | "teal" | "orange" | "pink" | "gray" | "red";
  valueClassName?: string;
  className?: string;
  footer?: ReactNode;
}

const accentStyles: Record<
  NonNullable<StatCardProps["accent"]>,
  { icon: string; border?: string }
> = {
  blue: { icon: "bg-blue-50 text-blue-600" },
  yellow: { icon: "bg-amber-50 text-amber-600" },
  purple: { icon: "bg-violet-50 text-violet-600" },
  teal: {
    icon: "bg-teal-50 text-teal-700",
    border: "border-l-4 border-l-[#1b3a3a]",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    border: "border-l-4 border-l-orange-400",
  },
  pink: {
    icon: "bg-rose-50 text-rose-500",
    border: "border-l-4 border-l-rose-300",
  },
  gray: {
    icon: "bg-slate-100 text-slate-600",
    border: "border-l-4 border-l-slate-400",
  },
  red: { icon: "bg-red-50 text-red-600" },
};

export function StatCard({
  label,
  value,
  icon,
  accent = "blue",
  valueClassName,
  className,
  footer,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        styles.border,
        className
      )}
    >
      {icon ? (
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            styles.icon
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn("mt-1 text-2xl font-bold text-slate-900", valueClassName)}>
          {value}
        </p>
        {footer}
      </div>
    </div>
  );
}
