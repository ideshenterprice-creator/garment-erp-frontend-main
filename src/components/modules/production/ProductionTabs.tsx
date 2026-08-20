"use client";

import type { ProductionStageTab } from "@/mock/production";
import {
  CheckCircle2,
  Palette,
  Printer,
  Scissors,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: {
  value: ProductionStageTab;
  label: string;
  icon: typeof Scissors;
}[] = [
  { value: "CUTTING", label: "Cutting", icon: Scissors },
  { value: "PRINTING", label: "Printing", icon: Printer },
  { value: "COLORING", label: "Coloring", icon: Palette },
  { value: "STITCHING", label: "Stitching", icon: Shirt },
  { value: "FINISHING", label: "Finishing", icon: CheckCircle2 },
];

interface ProductionTabsProps {
  activeTab: ProductionStageTab;
  onChange: (tab: ProductionStageTab) => void;
}

export function ProductionTabs({ activeTab, onChange }: ProductionTabsProps) {
  return (
    <div className="mb-4 border-b border-slate-200">
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-[#1b3a3a]"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
              {active ? (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-teal-600" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
