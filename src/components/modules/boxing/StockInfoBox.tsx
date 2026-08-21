import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockInfoBoxProps {
  designNumber: string;
  color: string;
  available: number;
  packing: number;
  error?: boolean;
}

export function StockInfoBox({
  designNumber,
  color,
  available,
  packing,
  error = false,
}: StockInfoBoxProps) {
  const remaining = available - packing;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-3 text-sm",
        error
          ? "border border-red-200 bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600"
      )}
    >
      <Info
        className={cn(
          "mt-0.5 size-4 shrink-0",
          error ? "text-red-600" : "text-sky-600"
        )}
      />
      {error ? (
        <p>
          Not enough finished stock. Available: {available.toLocaleString("en-IN")}.
          You entered: {packing.toLocaleString("en-IN")}.
        </p>
      ) : (
        <p>
          Finished stock available for {designNumber} {color}:{" "}
          {available.toLocaleString("en-IN")} pcs. You are packing:{" "}
          {packing.toLocaleString("en-IN")} pcs. Remaining after:{" "}
          {remaining.toLocaleString("en-IN")} pcs.
        </p>
      )}
    </div>
  );
}
