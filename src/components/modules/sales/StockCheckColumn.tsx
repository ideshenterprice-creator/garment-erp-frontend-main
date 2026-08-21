import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCheckColumnProps {
  available: number;
  quantity: number;
}

export function StockCheckColumn({
  available,
  quantity,
}: StockCheckColumnProps) {
  const ok = quantity <= available && quantity > 0;
  const empty = quantity <= 0;

  if (empty) {
    return <span className="text-xs text-muted-foreground">Enter qty</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {ok ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <XCircle className="size-3.5" />
      )}
      {ok
        ? `${available.toLocaleString("en-IN")} in stock`
        : `Only ${available.toLocaleString("en-IN")} in stock`}
    </span>
  );
}
