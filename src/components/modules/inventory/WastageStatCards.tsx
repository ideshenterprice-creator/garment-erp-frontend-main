import { FileText, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WastageStatCardsProps {
  totalInStockKg: number;
  totalSoldKg: number;
  totalValue: number;
  stockChangePercent?: number;
}

export function WastageStatCards({
  totalInStockKg,
  totalSoldKg,
  totalValue,
  stockChangePercent = 4.2,
}: WastageStatCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 border-t-2 border-t-amber-400 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Wastage in Stock
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {totalInStockKg.toLocaleString("en-IN")} kg
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <TrendingUp className="size-3.5" />
          +{stockChangePercent}% from last week
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 border-t-2 border-t-amber-400 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Wastage Sold
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {totalSoldKg.toLocaleString("en-IN")} kg
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShoppingCart className="size-3.5" />
          Lifetime sales volume
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 border-t-2 border-t-amber-400 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Wastage Value
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {formatCurrency(totalValue)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          Estimated inventory value
        </p>
      </div>
    </div>
  );
}
