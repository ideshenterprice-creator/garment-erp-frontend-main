import { formatCurrency } from "@/lib/utils";

interface SalesRegisterSummaryProps {
  totalSales: number;
  totalPieces: number;
  outstanding: number;
}

export function SalesRegisterSummary({
  totalSales,
  totalPieces,
  outstanding,
}: SalesRegisterSummaryProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Sales
        </p>
        <p className="mt-2 text-2xl font-bold">{formatCurrency(totalSales)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Pieces
        </p>
        <p className="mt-2 text-2xl font-bold">
          {totalPieces.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Outstanding
        </p>
        <p className="mt-2 text-2xl font-bold text-amber-800">
          {formatCurrency(outstanding)}
        </p>
      </div>
    </div>
  );
}
