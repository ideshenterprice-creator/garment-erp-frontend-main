import { CheckCircle2, Clock3, FileSpreadsheet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SalesStatCardsProps {
  totalBilled: number;
  pendingPayment: number;
  billsRaised: number;
  overdueCount: number;
  draftCount: number;
}

export function SalesStatCards({
  totalBilled,
  pendingPayment,
  billsRaised,
  overdueCount,
  draftCount,
}: SalesStatCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Billed
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {formatCurrency(totalBilled)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <FileSpreadsheet className="size-3.5" />
          Across {billsRaised} invoice{billsRaised === 1 ? "" : "s"}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Pending Payment
        </p>
        <p className="mt-2 text-2xl font-bold text-amber-800">
          {formatCurrency(pendingPayment)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs text-orange-600">
          <Clock3 className="size-3.5" />
          {overdueCount} invoice{overdueCount === 1 ? "" : "s"} awaiting payment
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Bills Raised
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{billsRaised}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="size-3.5" />
          {draftCount} draft{draftCount === 1 ? "" : "s"} pending submit
        </p>
      </div>
    </div>
  );
}
