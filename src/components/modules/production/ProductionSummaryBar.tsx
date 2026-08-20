import { cn, formatCurrency } from "@/lib/utils";

export interface ProductionSummaryStat {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "accent";
}

interface ProductionSummaryBarProps {
  stats: ProductionSummaryStat[];
  className?: string;
}

export function ProductionSummaryBar({
  stats,
  className,
}: ProductionSummaryBarProps) {
  return (
    <div
      className={cn(
        "mt-4 rounded-xl bg-[#1b3a3a] px-4 py-4 text-white shadow-sm md:px-6",
        className
      )}
    >
      <div
        className={cn(
          "grid gap-4",
          stats.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        )}
      >
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold",
                stat.tone === "warning" && "text-orange-300",
                stat.tone === "accent" && "text-amber-300",
                (!stat.tone || stat.tone === "default") && "text-white"
              )}
            >
              {typeof stat.value === "number"
                ? formatCurrency(stat.value)
                : stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
