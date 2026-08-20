"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FilterTab {
  label: string;
  value: string;
}

interface FilterBarProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  extraActions?: ReactNode;
  className?: string;
}

export function FilterBar({
  tabs,
  activeTab,
  onTabChange,
  extraActions,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {extraActions ? (
        <div className="flex flex-wrap items-center gap-2">{extraActions}</div>
      ) : null}
    </div>
  );
}
