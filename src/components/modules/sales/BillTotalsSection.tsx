import { formatCurrency } from "@/lib/utils";

interface BillTotalsSectionProps {
  subTotal: number;
  gstAmount?: number;
  netTotal: number;
}

export function BillTotalsSection({
  subTotal,
  gstAmount = 0,
  netTotal,
}: BillTotalsSectionProps) {
  return (
    <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Sub Total</span>
        <span className="font-medium">{formatCurrency(subTotal)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-500">GST (Export 0%)</span>
        <span className="font-medium">{formatCurrency(gstAmount)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 pt-2">
        <span className="font-semibold text-slate-900">Net Total</span>
        <span className="text-lg font-bold text-[#1b3a3a]">
          {formatCurrency(netTotal)}
        </span>
      </div>
    </div>
  );
}
