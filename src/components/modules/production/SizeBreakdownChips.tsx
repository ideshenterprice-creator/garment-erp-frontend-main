import type { SizeBreakdown } from "@/mock/production";
import { cn } from "@/lib/utils";

const chipLabels: { key: keyof SizeBreakdown; label: string }[] = [
  { key: "qty_0_3M", label: "S" },
  { key: "qty_3_6M", label: "M" },
  { key: "qty_6_9M", label: "L" },
  { key: "qty_9_12M", label: "XL" },
  { key: "qty_12_18M", label: "2XL" },
  { key: "qty_18_24M", label: "3XL" },
];

interface SizeBreakdownChipsProps {
  sizes: SizeBreakdown;
  className?: string;
}

export function SizeBreakdownChips({
  sizes,
  className,
}: SizeBreakdownChipsProps) {
  const chips = chipLabels.filter((item) => sizes[item.key] > 0);

  if (chips.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
        >
          {chip.label}:{sizes[chip.key]}
        </span>
      ))}
    </div>
  );
}
