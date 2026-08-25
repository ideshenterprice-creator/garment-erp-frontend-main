import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AccountStatementSummaryProps {
  totalBilled: number;
  totalReceived: number;
  outstanding: number;
  lastTransactionDate: string;
}

export function AccountStatementSummary({
  totalBilled,
  totalReceived,
  outstanding,
  lastTransactionDate,
}: AccountStatementSummaryProps) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Billed
        </p>
        <p className="mt-2 text-xl font-bold">{formatCurrency(totalBilled)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Received
        </p>
        <p className="mt-2 text-xl font-bold">{formatCurrency(totalReceived)}</p>
      </div>
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-red-500 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Outstanding
        </p>
        <p
          className={cn(
            "mt-2 text-xl font-bold",
            outstanding > 0 ? "text-red-600" : "text-slate-900"
          )}
        >
          {formatCurrency(outstanding)}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-orange-400 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Last Transaction Date
        </p>
        <p className="mt-2 text-xl font-bold">{lastTransactionDate}</p>
      </div>
    </div>
  );
}
