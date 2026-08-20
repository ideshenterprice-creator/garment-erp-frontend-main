import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import type { MockPurchaseBill } from "@/mock/purchase";

interface StockUpdateInfoProps {
  bill: MockPurchaseBill;
}

export function StockUpdateInfo({ bill }: StockUpdateInfoProps) {
  if (bill.status !== "CONFIRMED" || !bill.stockUpdatedAt) {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
      <div className="flex gap-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-900">Stock Updated Successfully</p>
          <p className="mt-1 text-sm text-emerald-800">
            {bill.netWeight.toLocaleString("en-IN")} kg of {bill.fabricLabel}{" "}
            Fabric added to stock on{" "}
            {format(new Date(bill.stockUpdatedAt), "dd MMM yyyy")} at{" "}
            {format(new Date(bill.stockUpdatedAt), "hh:mm a")}.
          </p>
        </div>
      </div>
    </div>
  );
}
