import type { ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

const categoryLabel: Record<ProductCategory, string> = {
  RAW_MATERIAL: "Raw Material",
  FINISHED_GOOD: "Finished Good",
  ACCESSORY: "Accessory",
  WASTAGE: "Wastage",
};

const categoryClass: Record<ProductCategory, string> = {
  RAW_MATERIAL: "bg-teal-50 text-teal-700",
  FINISHED_GOOD: "bg-orange-50 text-orange-700",
  ACCESSORY: "bg-violet-50 text-violet-700",
  WASTAGE: "bg-rose-50 text-rose-700",
};

interface StockCategoryBadgeProps {
  category: ProductCategory;
  className?: string;
}

export function StockCategoryBadge({
  category,
  className,
}: StockCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryClass[category],
        className
      )}
    >
      {categoryLabel[category]}
    </span>
  );
}

export function getCategoryLabel(category: ProductCategory): string {
  return categoryLabel[category];
}
