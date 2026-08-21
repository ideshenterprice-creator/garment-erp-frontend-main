import type { MockSalesBill } from "@/mock/sales";
import { Info } from "lucide-react";

interface BillDetailCardProps {
  bill: MockSalesBill;
}

export function BillDetailCard({ bill }: BillDetailCardProps) {
  const fields = [
    { label: "Customer", value: bill.buyer.name },
    { label: "Purchase Order", value: bill.po.poNumber },
    {
      label: "Currency",
      value: `${bill.currency}${bill.currency === "USD" ? " (United States Dollar)" : ""}`,
    },
    { label: "Carton No.", value: bill.containerNo || "—" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Info className="size-4 text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900">Invoice Info</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {field.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {field.value}
            </p>
          </div>
        ))}
        <div className="sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Billing Address
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.billingAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
