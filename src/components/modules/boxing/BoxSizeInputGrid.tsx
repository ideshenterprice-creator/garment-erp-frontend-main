"use client";

import type { BoxSizeQty } from "@/mock/boxing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sizeFields: { key: keyof BoxSizeQty; label: string }[] = [
  { key: "qty_0_3M", label: "0-3M" },
  { key: "qty_3_6M", label: "3-6M" },
  { key: "qty_6_9M", label: "6-9M" },
  { key: "qty_9_12M", label: "9-12M" },
  { key: "qty_12_18M", label: "12-18M" },
  { key: "qty_18_24M", label: "18-24M" },
];

interface BoxSizeInputGridProps {
  values: BoxSizeQty;
  onChange: (key: keyof BoxSizeQty, value: number) => void;
}

export function BoxSizeInputGrid({ values, onChange }: BoxSizeInputGridProps) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Pieces by Size
      </p>
      <div className="grid grid-cols-3 gap-3">
        {sizeFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label className="text-xs text-slate-500">{field.label}</Label>
            <Input
              type="number"
              min={0}
              value={values[field.key]}
              onChange={(event) =>
                onChange(field.key, Number(event.target.value) || 0)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
