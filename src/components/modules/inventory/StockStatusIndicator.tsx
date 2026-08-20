import type { ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

const barClass: Record<ProductCategory, string> = {
  RAW_MATERIAL: "bg-teal-500",
  FINISHED_GOOD: "bg-orange-400",
  ACCESSORY: "bg-violet-400",
  WASTAGE: "bg-rose-400",
};

interface StockStatusIndicatorProps {
  category: ProductCategory;
  isZeroStock?: boolean;
  className?: string;
}

export function StockStatusIndicator({
  category,
  isZeroStock = false,
  className,
}: StockStatusIndicatorProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-0 top-0 h-full w-1",
        isZeroStock ? "bg-red-600" : barClass[category],
        className
      )}
    />
  );
}
