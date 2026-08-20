import { ClipboardList, Info } from "lucide-react";
import type { PurchaseOrder } from "@/types";
import { format } from "date-fns";

interface PODetailCardProps {
  order: PurchaseOrder;
}

export function PODetailCard({ order }: PODetailCardProps) {
  const fields = [
    { label: "Buyer", value: order.buyer.name },
    { label: "Ref No", value: order.buyerPoReference },
    {
      label: "Dates",
      value: `${format(new Date(order.orderDate), "dd MMM")} - ${format(
        new Date(order.deliveryDate),
        "dd MMM"
      )}`,
    },
    { label: "Destination", value: order.shippingDestination },
    { label: "Terms", value: order.paymentTerms },
    {
      label: "Total Pieces",
      value: order.totalPieces.toLocaleString("en-IN"),
    },
    {
      label: "Total Designs",
      value: `${order.totalDesigns} Designs`,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Info className="size-4 text-slate-500" />
        <h2 className="font-semibold text-slate-900">Order Summary</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {field.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{field.value}</p>
          </div>
        ))}
      </div>
      {order.specialInstructions ? (
        <div className="mt-4 flex gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <ClipboardList className="mt-0.5 size-4 shrink-0 text-slate-500" />
          <p>{order.specialInstructions}</p>
        </div>
      ) : null}
    </div>
  );
}
