import { CalendarDays, ClipboardCheck, ScrollText } from "lucide-react";

interface BillStatCardsProps {
  totalBillsThisMonth: number;
  totalFabricPurchasedKg: number;
  pendingApproval: number;
}

export function BillStatCards({
  totalBillsThisMonth,
  totalFabricPurchasedKg,
  pendingApproval,
}: BillStatCardsProps) {
  const cards = [
    {
      label: "Total Bills This Month",
      value: String(totalBillsThisMonth),
      icon: <CalendarDays className="size-5" />,
      iconClass: "bg-sky-50 text-sky-600",
    },
    {
      label: "Total Fabric Purchased",
      value: `${totalFabricPurchasedKg.toLocaleString("en-IN")} kg`,
      icon: <ScrollText className="size-5" />,
      iconClass: "bg-orange-50 text-orange-600",
    },
    {
      label: "Pending Approval",
      value: String(pendingApproval),
      icon: <ClipboardCheck className="size-5" />,
      iconClass: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
          >
            {card.icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
