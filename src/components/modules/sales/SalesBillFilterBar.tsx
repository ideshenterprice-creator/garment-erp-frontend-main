"use client";

import { Filter } from "lucide-react";
import type { SalesBillStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SalesBillFilter = "ALL" | SalesBillStatus;

const tabs: { label: string; value: SalesBillFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Paid", value: "PAID" },
  { label: "Returned", value: "RETURNED" },
];

interface SalesBillFilterBarProps {
  filter: SalesBillFilter;
  onChange: (filter: SalesBillFilter) => void;
}

export function SalesBillFilterBar({
  filter,
  onChange,
}: SalesBillFilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              filter === tab.value
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
            {filter === tab.value ? (
              <span className="absolute inset-x-1 -bottom-px h-0.5 bg-slate-900" />
            ) : null}
          </button>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="text-slate-600">
        <Filter className="size-4" />
        Filters
      </Button>
    </div>
  );
}
