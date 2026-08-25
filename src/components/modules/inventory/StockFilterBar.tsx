"use client";

import type { ProductCategory } from "@/types";
import type { StockSortOption } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StockFilterTab = "ALL" | ProductCategory;

const filterTabs: { label: string; value: StockFilterTab }[] = [
  { label: "All", value: "ALL" },
  { label: "Raw Material", value: "RAW_MATERIAL" },
  { label: "Finished Goods", value: "FINISHED_GOOD" },
  { label: "Accessories", value: "ACCESSORY" },
  { label: "Wastage", value: "WASTAGE" },
];

interface StockFilterBarProps {
  filter: StockFilterTab;
  sortBy: StockSortOption;
  onFilterChange: (filter: StockFilterTab) => void;
  onSortChange: (sort: StockSortOption) => void;
}

export function StockFilterBar({
  filter,
  sortBy,
  onFilterChange,
  onSortChange,
}: StockFilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Sort by:
        </span>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as StockSortOption)}
        >
          <SelectTrigger className="h-9 w-[200px] border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastUpdated">Last Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="quantityDesc">Stock (High to Low)</SelectItem>
            <SelectItem value="quantityAsc">Stock (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
