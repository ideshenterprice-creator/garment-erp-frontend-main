import { AlertCircle } from "lucide-react";

interface StockValidationErrorProps {
  available: number;
  entered: number;
  unit: string;
}

export function StockValidationError({
  available,
  entered,
  unit,
}: StockValidationErrorProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">Insufficient stock</span> Available:{" "}
        {available.toLocaleString("en-IN")} {unit}. You entered:{" "}
        {entered.toLocaleString("en-IN")} {unit}. Please reduce quantity or
        update inventory records.
      </p>
    </div>
  );
}
