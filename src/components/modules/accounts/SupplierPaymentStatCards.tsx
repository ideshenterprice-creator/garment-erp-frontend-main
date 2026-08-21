import { CheckCircle2, ClipboardList } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SupplierPaymentStatCardsProps {
  totalPending: number;
  totalPaidThisMonth: number;
}

export function SupplierPaymentStatCards({
  totalPending,
  totalPaidThisMonth,
}: SupplierPaymentStatCardsProps) {
  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 border-l-4 border-l-red-500 bg-white p-4 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <ClipboardList className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Pending
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 border-l-4 border-l-[#1b3a3a] bg-white p-4 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Paid This Month
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(totalPaidThisMonth)}
          </p>
        </div>
      </div>
    </div>
  );
}
