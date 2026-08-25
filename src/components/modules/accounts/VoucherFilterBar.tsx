"use client";

import type { VoucherType } from "@/types";
import { cn } from "@/lib/utils";

export type VoucherFilter = "ALL" | VoucherType;

interface VoucherFilterBarProps {
  filter: VoucherFilter;
  onChange: (filter: VoucherFilter) => void;
}

const tabs: { label: string; value: VoucherFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Payment", value: "PAYMENT" },
  { label: "Receipt", value: "RECEIPT" },
];

export function VoucherFilterBar({
  filter,
  onChange,
}: VoucherFilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
