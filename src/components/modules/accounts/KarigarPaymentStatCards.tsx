import { AlertTriangle, Banknote, ClipboardList } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KarigarPaymentStatCardsProps {
  totalDueThisWeek: number;
  totalPaidThisMonth: number;
  pendingCount: number;
}

export function KarigarPaymentStatCards({
  totalDueThisWeek,
  totalPaidThisMonth,
  pendingCount,
}: KarigarPaymentStatCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Due This Week
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalDueThisWeek)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <ClipboardList className="size-5" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Paid This Month
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalPaidThisMonth)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Banknote className="size-5" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pending Payments
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <AlertTriangle className="size-5" />
        </div>
      </div>
    </div>
  );
}
