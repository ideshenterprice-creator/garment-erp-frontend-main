"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WeightCalculatorProps {
  grossWeight: number;
  tareWeight: number;
  onGrossChange: (value: number) => void;
  onTareChange: (value: number) => void;
  grossError?: string;
  tareError?: string;
}

export function WeightCalculator({
  grossWeight,
  tareWeight,
  onGrossChange,
  onTareChange,
  grossError,
  tareError,
}: WeightCalculatorProps) {
  const rawNet = (grossWeight || 0) - (tareWeight || 0);
  const netWeight = Math.max(0, rawNet);
  const netError =
    Number.isFinite(rawNet) && rawNet < 0
      ? "Gross weight must be greater than tare weight"
      : undefined;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Gross (kg)
        </Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(grossWeight) ? grossWeight : 0}
          onChange={(event) => onGrossChange(Number(event.target.value) || 0)}
        />
        {grossError ? (
          <p className="text-sm text-destructive">{grossError}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Tare (kg)
        </Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(tareWeight) ? tareWeight : 0}
          onChange={(event) => onTareChange(Number(event.target.value) || 0)}
        />
        {tareError ? (
          <p className="text-sm text-destructive">{tareError}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Net (kg)
        </Label>
        <div className="flex h-10 items-center rounded-md border border-input bg-slate-50 px-3">
          <span className="text-sm font-bold text-teal-700">
            {netWeight.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            kg
          </span>
        </div>
        {netError ? (
          <p className="text-sm text-destructive">{netError}</p>
        ) : null}
      </div>
    </div>
  );
}
