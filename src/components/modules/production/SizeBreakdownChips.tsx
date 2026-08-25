import type { SizeBreakdown } from "@/types";
import { SIZE_FIELD_KEYS, SIZE_FIELD_LABELS } from "@/lib/production";
import { cn } from "@/lib/utils";

interface SizeBreakdownChipsProps {
  sizes: SizeBreakdown;
  className?: string;
}

export function SizeBreakdownChips({
  sizes,
  className,
}: SizeBreakdownChipsProps) {
  const chips = SIZE_FIELD_KEYS.filter((key) => Number(sizes[key]) > 0);

  if (chips.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {chips.map((key) => (
        <span
          key={key}
          className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
        >
          {SIZE_FIELD_LABELS[key]}:{Number(sizes[key]).toLocaleString("en-IN")}
        </span>
      ))}
    </div>
  );
}
